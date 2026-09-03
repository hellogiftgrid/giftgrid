import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendAdminBookingEmail,
  sendGuestBookingEmail,
} from "@/lib/email/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verifySignature(
  body: string,
  signature: string | null,
  secret: string
) {
  if (!signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  const a = Buffer.from(signature, "utf8");
  const b = Buffer.from(expected, "utf8");

  return a.length === b.length &&
    crypto.timingSafeEqual(a, b);
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "GiftGrid Cal webhook",
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();

  const secret = process.env.CAL_WEBHOOK_SECRET;

  if (!secret) {
    console.error("CAL_WEBHOOK_SECRET is missing");

    return NextResponse.json(
      { error: "Webhook not configured." },
      { status: 503 }
    );
  }

  const signature =
    request.headers.get("x-cal-signature-256") ||
    request.headers.get("X-Cal-Signature-256");

  if (!verifySignature(body, signature, secret)) {
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 401 }
    );
  }

  let event: any;

  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON." },
      { status: 400 }
    );
  }

  const trigger = event?.triggerEvent;
  const payload = event?.payload || {};

  console.log("GiftGrid Cal webhook:", trigger);

  if (!["BOOKING_CREATED", "BOOKING_RESCHEDULED", "BOOKING_CANCELLED"].includes(trigger)) {
    return NextResponse.json({
      ok: true,
      ignored: true,
      trigger,
    });
  }

  const uid =
    payload?.uid ||
    payload?.bookingUid ||
    payload?.id;

  if (!uid) {
    return NextResponse.json(
      { error: "Cal booking UID missing." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  if (trigger === "BOOKING_CANCELLED") {
    const { error } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
      })
      .eq("cal_booking_uid", uid);

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Could not cancel booking." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  }

  const guest =
    payload?.attendees?.[0] ||
    {};

  const organizer =
    payload?.organizer ||
    {};

  const guestName =
    payload?.responses?.name?.value ||
    guest?.name ||
    "Guest";

  const guestEmail =
    payload?.responses?.email?.value ||
    guest?.email;

  const adminEmail =
    organizer?.email || null;

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
    payload?.location ||
    null;

  if (!guestEmail || !startTime || !endTime) {
    return NextResponse.json(
      {
        error:
          "Required Cal booking information is missing.",
      },
      { status: 400 }
    );
  }

  const { data: existing } = await supabase
    .from("bookings")
    .select("id, booked_call_token")
    .eq("cal_booking_uid", uid)
    .maybeSingle();

  let bookingId: string;
  let bookedCallToken: string;

  if (existing) {
    bookingId = existing.id;
    bookedCallToken =
      existing.booked_call_token ||
      crypto.randomBytes(24).toString("hex");

    const { error } = await supabase
      .from("bookings")
      .update({
        start_at: new Date(startTime).toISOString(),
        end_at: new Date(endTime).toISOString(),
        guest_timezone: timezone,
        cal_meeting_url: meetingUrl,
        status: "confirmed",
        booked_call_token: bookedCallToken,
      })
      .eq("id", bookingId);

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Could not update booking." },
        { status: 500 }
      );
    }
  } else {
    const { data: byEmail } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", adminEmail || "")
      .maybeSingle();

    let primaryAdminId: string | null = null;

    if (byEmail) {
      const { data: bookingAdmin } = await supabase
        .from("booking_admins")
        .select("id")
        .eq("profile_id", byEmail.id)
        .maybeSingle();

      primaryAdminId = bookingAdmin?.id || null;
    }

    if (!primaryAdminId) {
      return NextResponse.json(
        {
          error:
            "Cal organizer is not linked to a GiftGrid admin.",
        },
        { status: 422 }
      );
    }

    bookedCallToken = crypto
      .randomBytes(24)
      .toString("hex");

    const { data: inserted, error } = await supabase
      .from("bookings")
      .insert({
        cal_booking_uid: uid,
        cal_meeting_url: meetingUrl,
        booked_call_token: bookedCallToken,
        primary_admin_id: primaryAdminId,
        guest_name: guestName,
        guest_email: guestEmail,
        start_at: new Date(startTime).toISOString(),
        end_at: new Date(endTime).toISOString(),
        guest_timezone: timezone,
        status: "confirmed",
        meeting_type: "cal_video",
      })
      .select("id")
      .single();

    if (error || !inserted) {
      console.error("Booking insert:", error);

      return NextResponse.json(
        { error: "Could not create GiftGrid booking." },
        { status: 500 }
      );
    }

    bookingId = inserted.id;
  }

  const site =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.degiftgrid.com";

  const bookedCallUrl =
    `${site}/bookedcall/${bookedCallToken}`;

  const humanStart = new Intl.DateTimeFormat("en", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(startTime));

  const humanEnd = new Intl.DateTimeFormat("en", {
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(endTime));

  const emailJobs: Promise<unknown>[] = [
    sendGuestBookingEmail({
      guestName,
      guestEmail,
      adminName,
      startTime: humanStart,
      endTime: humanEnd,
      timezone,
      bookedCallUrl,
      meetingUrl,
      bookingUid: uid,
    }),
  ];

  if (adminEmail) {
    emailJobs.push(
      sendAdminBookingEmail({
        adminEmail,
        adminName,
        guestName,
        guestEmail,
        startTime: humanStart,
        endTime: humanEnd,
        timezone,
        adminUrl: `${site}/admin/calls`,
        bookingUid: uid,
      })
    );
  }

  const results = await Promise.allSettled(emailJobs);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Resend error:", result.reason);
    }
  }

  return NextResponse.json({
    ok: true,
    bookingId,
    bookedCallUrl,
    meetingUrl,
  });
}
