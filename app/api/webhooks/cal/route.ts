import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifyCalSignature } from "@/lib/cal/verify";
import {
  sendAdminBookingEmail,
  sendGuestBookingEmail,
} from "@/lib/email/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}

function extractMeetingUrl(payload: any): string | null {
  const candidates = [
    payload?.videoCallUrl,
    payload?.meetingUrl,
    payload?.metadata?.videoCallUrl,
    payload?.metadata?.meetingUrl,
    payload?.videoCallData?.url,
    payload?.videoCallData?.joinUrl,
    payload?.location?.url,
    payload?.location?.link,
    payload?.location,
  ];

  for (const candidate of candidates) {
    const value = text(candidate);

    if (
      value &&
      /^https?:\/\//i.test(value) &&
      !value.includes("cal.com")
    ) {
      return value;
    }

    if (value && /^https?:\/\//i.test(value)) {
      return value;
    }
  }

  return null;
}

function normalizeStatus(trigger: string) {
  if (trigger === "BOOKING_CANCELLED") return "cancelled";
  return "confirmed";
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "GiftGrid Cal webhook",
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  const secret = process.env.CAL_WEBHOOK_SECRET;

  if (!secret) {
    console.error("CAL_WEBHOOK_SECRET is not configured.");
    return NextResponse.json(
      { error: "Webhook configuration error." },
      { status: 503 }
    );
  }

  const signature =
    request.headers.get("X-Cal-Signature-256") ||
    request.headers.get("x-cal-signature-256");

  if (!verifyCalSignature(rawBody, signature, secret)) {
    console.warn("[GiftGrid Cal] invalid signature");
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

  const trigger = event?.triggerEvent;

  console.log("[GiftGrid Cal] webhook received", {
    trigger,
    hasPayload: !!event?.payload,
  });

  if (
    ![
      "BOOKING_CREATED",
      "BOOKING_RESCHEDULED",
      "BOOKING_CANCELLED",
    ].includes(trigger)
  ) {
    return NextResponse.json({
      ok: true,
      ignored: true,
      trigger,
    });
  }

  const payload = event?.payload || {};

  const uid =
    text(payload?.uid) ||
    text(payload?.bookingUid) ||
    text(payload?.bookingId);

  if (!uid) {
    return NextResponse.json(
      { error: "Booking UID missing." },
      { status: 400 }
    );
  }

  const startTime = text(payload?.startTime);
  const endTime = text(payload?.endTime);

  if (!startTime || !endTime) {
    return NextResponse.json(
      { error: "Booking time missing." },
      { status: 400 }
    );
  }

  const attendee = payload?.attendees?.[0] || {};
  const organizer = payload?.organizer || {};

  const guestName =
    text(payload?.responses?.name?.value) ||
    text(attendee?.name) ||
    "Guest";

  const guestEmail =
    text(payload?.responses?.email?.value) ||
    text(attendee?.email);

  if (!guestEmail) {
    return NextResponse.json(
      { error: "Guest email missing." },
      { status: 400 }
    );
  }

  const adminEmail =
    text(organizer?.email) ||
    text(organizer?.username && `${organizer.username}`);

  const timezone =
    text(attendee?.timeZone) ||
    text(payload?.attendee?.timeZone) ||
    text(organizer?.timeZone) ||
    "UTC";

  const meetingUrl = extractMeetingUrl(payload);

  console.log("[GiftGrid Cal] parsed booking", {
    uid,
    guestEmail,
    organizerEmail: organizer?.email || null,
    organizerName: organizer?.name || null,
    timezone,
    meetingUrl,
  });

  const supabase = createAdminClient();

  if (trigger === "BOOKING_CANCELLED") {
    const { error } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cal_meeting_url: meetingUrl,
      })
      .eq("cal_booking_uid", uid);

    if (error) {
      console.error("Cal cancellation update:", error);

      return NextResponse.json(
        { error: "Unable to update booking." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      cancelled: true,
      bookingUid: uid,
    });
  }

  const { data: existing } = await supabase
    .from("bookings")
    .select("id, booked_call_token")
    .eq("cal_booking_uid", uid)
    .maybeSingle();

  let booking = existing;

  if (!booking) {
    let primaryAdminId: string | null = null;

    if (adminEmail) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", adminEmail)
        .maybeSingle();

      if (profile?.id) {
        const { data: bookingAdmin } = await supabase
          .from("booking_admins")
          .select("id")
          .eq("profile_id", profile.id)
          .eq("active", true)
          .eq("accepting_bookings", true)
          .maybeSingle();

        primaryAdminId = bookingAdmin?.id || null;
      }
    }

    if (!primaryAdminId) {
      const organizerName = text(organizer?.name);

      if (organizerName) {
        const { data: bookingAdmin } = await supabase
          .from("booking_admins")
          .select("id")
          .eq("active", true)
          .eq("accepting_bookings", true)
          .ilike("display_name", `%${organizerName}%`)
          .maybeSingle();

        primaryAdminId = bookingAdmin?.id || null;
      }
    }

    if (!primaryAdminId) {
      console.error(
        "Unable to map Cal organizer:",
        JSON.stringify(
          {
            organizerName: organizer?.name,
            organizerEmail: organizer?.email,
          },
          null,
          2
        )
      );

      return NextResponse.json(
        {
          error:
            "Could not map the Cal.com organizer to a GiftGrid admin.",
        },
        { status: 422 }
      );
    }

    const bookedCallToken = crypto
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
      .select("id, booked_call_token")
      .single();

    if (error) {
      console.error("[GiftGrid Cal] booking creation error:", error);

      return NextResponse.json(
        { error: "Unable to create GiftGrid booking." },
        { status: 500 }
      );
    }

    booking = inserted;
  } else {
    const bookedCallToken =
      booking.booked_call_token ||
      crypto.randomBytes(24).toString("hex");

    const { data: updated, error } = await supabase
      .from("bookings")
      .update({
        cal_meeting_url: meetingUrl,
        start_at: new Date(startTime).toISOString(),
        end_at: new Date(endTime).toISOString(),
        status: normalizeStatus(trigger),
        booked_call_token: bookedCallToken,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_timezone: timezone,
      })
      .eq("id", booking.id)
      .select("id, booked_call_token")
      .single();

    if (error) {
      console.error("Booking update error:", error);

      return NextResponse.json(
        { error: "Unable to update GiftGrid booking." },
        { status: 500 }
      );
    }

    booking = updated;
  }

  const site =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.degiftgrid.com";

  const bookedCallUrl =
    `${site.replace(/\/$/, "")}/bookedcall/${booking.booked_call_token}`;

  const start = new Date(startTime);
  const end = new Date(endTime);

  const humanStart = new Intl.DateTimeFormat("en", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: timezone,
  }).format(start);

  const humanEnd = new Intl.DateTimeFormat("en", {
    timeStyle: "short",
    timeZone: timezone,
  }).format(end);

  const { data: adminProfile } = adminEmail
    ? await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("email", adminEmail)
        .maybeSingle()
    : { data: null };

  const organizerName =
    text(organizer?.name) || "GiftGrid Team";

  const emailJobs: Promise<any>[] = [];

  if (trigger === "BOOKING_CREATED") {
    emailJobs.push(
      sendGuestBookingEmail({
        guestName,
        guestEmail,
        adminName: organizerName,
        startTime: humanStart,
        endTime: humanEnd,
        timezone,
        bookedCallUrl,
        meetingUrl,
        bookingUid: uid,
      })
    );
  }

  if (adminProfile?.email) {
    emailJobs.push(
      sendAdminBookingEmail({
        adminEmail: adminProfile.email,
        adminName:
          adminProfile.full_name ||
          organizerName ||
          "GiftGrid Team",
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

  console.log("[GiftGrid Cal] sending emails", {
    guestEmail,
    adminEmail: adminProfile?.email || null,
    emailJobCount: emailJobs.length,
    bookedCallUrl,
  });

  const results = await Promise.allSettled(emailJobs);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error(
        "[GiftGrid Cal] Resend booking email error:",
        result.reason
      );
    } else {
      console.log("[GiftGrid Cal] Resend email accepted", result.value);
    }
  }

  return NextResponse.json({
    ok: true,
    trigger,
    bookingId: booking.id,
    bookedCallUrl,
    meetingUrl,
  });
}
