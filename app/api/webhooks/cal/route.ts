import { NextResponse } from "next/server";
import crypto from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifyCalSignature } from "@/lib/cal/verify";
import {
  sendAdminBookingEmail,
  sendGuestBookingEmail,
} from "@/lib/email/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rawBody = await request.text();

  const secret = process.env.CAL_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "CAL_WEBHOOK_SECRET is not configured." },
      { status: 503 }
    );
  }

  const signature =
    request.headers.get("X-Cal-Signature-256") ||
    request.headers.get("x-cal-signature-256");

  if (!verifyCalSignature(rawBody, signature, secret)) {
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

  const p = event?.payload || event;

  const uid = p?.uid || p?.bookingUid || null;
  const organizer = p?.organizer || {};
  const attendee = p?.attendees?.[0] || {};

  if (!uid) {
    return NextResponse.json(
      { error: "Booking UID missing." },
      { status: 400 }
    );
  }

  const startTime = p?.startTime;
  const endTime = p?.endTime;

  if (!startTime || !endTime) {
    return NextResponse.json(
      { error: "Booking time missing." },
      { status: 400 }
    );
  }

  const timezone =
    attendee?.timeZone ||
    organizer?.timeZone ||
    "UTC";

  const guestName =
    p?.responses?.name?.value ||
    attendee?.name ||
    "Guest";

  const guestEmail =
    p?.responses?.email?.value ||
    attendee?.email ||
    null;

  const adminEmail =
    organizer?.email ||
    null;

  if (!guestEmail) {
    return NextResponse.json(
      { error: "Guest email missing." },
      { status: 400 }
    );
  }

  const meetingUrl =
    p?.metadata?.videoCallUrl ||
    p?.location ||
    null;

  const supabase = createAdminClient();

  if (trigger === "BOOKING_CANCELLED") {
    const { error } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
      })
      .eq("cal_booking_uid", uid);

    if (error) {
      console.error("Cal cancellation update:", error);
      return NextResponse.json(
        { error: "Unable to update booking." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  }

  const { data: existing } = await supabase
    .from("bookings")
    .select("id, booked_call_token")
    .eq("cal_booking_uid", uid)
    .maybeSingle();

  let booking = existing;

  if (!booking) {
    const { data: adminRow } = await supabase
      .from("booking_admins")
      .select("id, profile_id")
      .eq("active", true)
      .eq("accepting_bookings", true)
      .ilike("display_name", `%${organizer?.name || ""}%`)
      .maybeSingle();

    let primaryAdminId = adminRow?.id || null;

    if (!primaryAdminId && adminEmail) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", adminEmail)
        .maybeSingle();

      if (profile) {
        const { data: byProfile } = await supabase
          .from("booking_admins")
          .select("id")
          .eq("profile_id", profile.id)
          .maybeSingle();

        primaryAdminId = byProfile?.id || null;
      }
    }

    if (!primaryAdminId) {
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
      console.error("Booking creation error:", error);

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
        status:
          trigger === "BOOKING_CANCELLED"
            ? "cancelled"
            : "confirmed",
        booked_call_token: bookedCallToken,
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
    `${site}/bookedcall/${booking.booked_call_token}`;

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

  const emailJobs = [
    sendGuestBookingEmail({
      guestName,
      guestEmail,
      adminName: organizer?.name || "GiftGrid Team",
      startTime: humanStart,
      endTime: humanEnd,
      timezone,
      bookedCallUrl,
      meetingUrl,
      bookingUid: uid,
    }),
  ];

  if (adminProfile?.email) {
    emailJobs.push(
      sendAdminBookingEmail({
        adminEmail: adminProfile.email,
        adminName:
          adminProfile.full_name ||
          organizer?.name ||
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

  const results = await Promise.allSettled(emailJobs);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Resend booking email error:", result.reason);
    }
  }

  return NextResponse.json({
    ok: true,
    bookingId: booking.id,
    bookedCallUrl,
    meetingUrl,
  });
}
