import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendAdminBookingEmail,
  sendGuestBookingEmail,
} from "@/lib/email/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validSignature(
  body: string,
  supplied: string | null,
  secret: string
) {
  if (!supplied) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  const left = Buffer.from(supplied, "utf8");
  const right = Buffer.from(expected, "utf8");

  return (
    left.length === right.length &&
    crypto.timingSafeEqual(left, right)
  );
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "GiftGrid Cal webhook",
  });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const secret = process.env.CAL_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "CAL_WEBHOOK_SECRET is not configured." },
      { status: 503 }
    );
  }

  const signature =
    request.headers.get("x-cal-signature-256") ||
    request.headers.get("X-Cal-Signature-256");

  if (!validSignature(rawBody, signature, secret)) {
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 401 }
    );
  }

  let event: any;

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON." },
      { status: 400 }
    );
  }

  const type = event?.triggerEvent;
  const payload = event?.payload || event;

  if (
    ![
      "BOOKING_CREATED",
      "BOOKING_RESCHEDULED",
      "BOOKING_CANCELLED",
    ].includes(type)
  ) {
    return NextResponse.json({
      ok: true,
      ignored: true,
      triggerEvent: type,
    });
  }

  const uid =
    payload?.uid ||
    payload?.bookingUid ||
    payload?.id;

  if (!uid) {
    return NextResponse.json(
      { error: "Missing Cal booking UID." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  if (type === "BOOKING_CANCELLED") {
    const { error } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
      })
      .eq("cal_booking_uid", uid);

    if (error) {
      console.error("Cancel booking error:", error);

      return NextResponse.json(
        { error: "Unable to cancel booking." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  }

  const attendees = Array.isArray(payload?.attendees)
    ? payload.attendees
    : [];

  const guest = attendees[0] || {};
  const organizer = payload?.organizer || {};

  const guestName =
    payload?.responses?.name?.value ||
    guest?.name ||
    "Guest";

  const guestEmail =
    payload?.responses?.email?.value ||
    guest?.email ||
    null;

  const adminEmail =
    organizer?.email ||
    null;

  const adminName =
    organizer?.name ||
    "GiftGrid Team";

  const startTime =
    payload?.startTime ||
    payload?.startAt;

  const endTime =
    payload?.endTime ||
    payload?.endAt;

  const timezone =
    guest?.timeZone ||
    organizer?.timeZone ||
    "UTC";

  const meetingUrl =
    payload?.metadata?.videoCallUrl ||
    payload?.metadata?.videoCallUrlV2 ||
    (
      typeof payload?.location === "string"
        ? payload.location
        : payload?.location?.value
    ) ||
    null;

  if (!guestEmail || !startTime || !endTime) {
    return NextResponse.json(
      { error: "Incomplete Cal booking payload." },
      { status: 400 }
    );
  }

  const { data: existing } = await supabase
    .from("bookings")
    .select("id, booked_call_token")
    .eq("cal_booking_uid", uid)
    .maybeSingle();

  const token =
    existing?.booked_call_token ||
    crypto.randomBytes(24).toString("hex");

  if (existing) {
    const { error } = await supabase
      .from("bookings")
      .update({
        start_at: new Date(startTime).toISOString(),
        end_at: new Date(endTime).toISOString(),
        guest_name: guestName,
        guest_email: guestEmail,
        guest_timezone: timezone,
        cal_meeting_url: meetingUrl,
        booked_call_token: token,
        status: "confirmed",
      })
      .eq("id", existing.id);

    if (error) {
      console.error("Booking update error:", error);

      return NextResponse.json(
        { error: "Unable to update booking." },
        { status: 500 }
      );
    }
  } else {
    let adminId: string | null = null;

    if (adminEmail) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", adminEmail)
        .maybeSingle();

      if (profile) {
        const { data: bookingAdmin } = await supabase
          .from("booking_admins")
          .select("id")
          .eq("profile_id", profile.id)
          .maybeSingle();

        adminId = bookingAdmin?.id || null;
      }
    }

    /*
     * If the Cal organizer email is unavailable, try to map by name.
     */
    if (!adminId && adminName) {
      const { data: namedAdmin } = await supabase
        .from("booking_admins")
        .select("id")
        .eq("display_name", adminName)
        .maybeSingle();

      adminId = namedAdmin?.id || null;
    }

    if (!adminId) {
      return NextResponse.json(
        {
          error:
            "Cal organizer is not linked to a GiftGrid booking admin.",
        },
        { status: 422 }
      );
    }

    const { error } = await supabase
      .from("bookings")
      .insert({
        cal_booking_uid: uid,
        cal_meeting_url: meetingUrl,
        booked_call_token: token,
        primary_admin_id: adminId,
        guest_name: guestName,
        guest_email: guestEmail,
        start_at: new Date(startTime).toISOString(),
        end_at: new Date(endTime).toISOString(),
        guest_timezone: timezone,
        status: "confirmed",
        meeting_type: "cal_video",
      });

    if (error) {
      console.error("Booking insert error:", error);

      return NextResponse.json(
        { error: "Unable to create booking." },
        { status: 500 }
      );
    }
  }

  const site =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.degiftgrid.com";

  const bookedCallUrl =
    `${site}/bookedcall/${token}`;

  const formattedStart =
    new Intl.DateTimeFormat("en", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: timezone,
    }).format(new Date(startTime));

  const formattedEnd =
    new Intl.DateTimeFormat("en", {
      timeStyle: "short",
      timeZone: timezone,
    }).format(new Date(endTime));

  const jobs: Promise<any>[] = [
    sendGuestBookingEmail({
      guestName,
      guestEmail,
      adminName,
      startTime: formattedStart,
      endTime: formattedEnd,
      timezone,
      bookedCallUrl,
      meetingUrl,
      bookingUid: uid,
    }),
  ];

  if (adminEmail) {
    jobs.push(
      sendAdminBookingEmail({
        adminEmail,
        adminName,
        guestName,
        guestEmail,
        startTime: formattedStart,
        endTime: formattedEnd,
        timezone,
        adminUrl: `${site}/admin/calls`,
        bookingUid: uid,
      })
    );
  }

  const results = await Promise.allSettled(jobs);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Resend error:", result.reason);
    }
  }

  return NextResponse.json({
    ok: true,
    bookedCallUrl,
    bookingUid: uid,
  });
}
