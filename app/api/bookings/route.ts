import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendAdminBookingEmail, sendGuestBookingEmail } from "@/lib/email/booking";
import { createGiftGridMeetEvent } from "@/lib/google/meet";

export const dynamic = "force-dynamic";

function token() {
  return randomBytes(24).toString("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      adminId,
      eventTypeId,
      startAt,
      guestName,
      guestEmail,
      guestPhone,
      guestNotes,
      guestTimezone,
    } = body;

    if (
      !adminId ||
      !eventTypeId ||
      !startAt ||
      !guestName ||
      !guestEmail ||
      !guestTimezone
    ) {
      return NextResponse.json(
        {
          error:
            "Name, email, call type, date/time and timezone are required.",
        },
        { status: 400 }
      );
    }

    const email = String(guestEmail).trim().toLowerCase();
    const name = String(guestName).trim();

    if (name.length < 2) {
      return NextResponse.json(
        { error: "Please enter your name." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const start = new Date(startAt);

    if (Number.isNaN(start.getTime())) {
      return NextResponse.json(
        { error: "Invalid appointment time." },
        { status: 400 }
      );
    }

    const publicClient = await createClient();

    const [{ data: admin }, { data: eventType }] =
      await Promise.all([
        publicClient
          .from("booking_admins")
          .select("*")
          .eq("id", adminId)
          .eq("active", true)
          .eq("accepting_bookings", true)
          .single(),

        publicClient
          .from("booking_event_types")
          .select("*")
          .eq("id", eventTypeId)
          .eq("active", true)
          .eq("public_bookable", true)
          .single(),
      ]);

    if (!admin) {
      return NextResponse.json(
        { error: "This admin is not currently accepting bookings." },
        { status: 404 }
      );
    }

    if (!eventType) {
      return NextResponse.json(
        { error: "This call type is not available." },
        { status: 404 }
      );
    }

    const end = new Date(
      start.getTime() +
        Number(eventType.duration_minutes) * 60 * 1000
    );

    if (start.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "Please choose a future appointment." },
        { status: 400 }
      );
    }

    /*
     * Check existing bookings immediately before insert.
     * PostgreSQL's exclusion constraint is still the final race-safe guard.
     */

    const supabase = createAdminClient();
    const { data: existing } = await supabase
      .from("bookings")
      .select("id, start_at, end_at")
      .eq("primary_admin_id", adminId)
      .in("status", [
        "pending",
        "confirmed",
        "rescheduled",
      ])
      .lt("start_at", end.toISOString())
      .gt("end_at", start.toISOString());

    if (existing?.length) {
      return NextResponse.json(
        {
          error:
            "That time is no longer available. Please choose another slot.",
        },
        { status: 409 }
      );
    }

    const bookedCallToken = token();
    if (!admin.google_refresh_token) {
      return NextResponse.json({ error: "GiftGrid Calendar is not connected yet." }, { status: 503 });
    }
    let calendarEvent: { eventId: string; meetUrl: string };
    try {
      calendarEvent = await createGiftGridMeetEvent({
        refreshToken: admin.google_refresh_token,
        calendarId: admin.google_calendar_email,
        guestName: name,
        guestEmail: email,
        startAt: start,
        endAt: end,
        timezone: String(guestTimezone),
        bookingToken: bookedCallToken,
      });
    } catch (calendarError) {
      console.error("GiftGrid Calendar Meet creation failed:", calendarError);
      return NextResponse.json({ error: "GiftGrid could not create the Meet room. Please try another time." }, { status: 503 });
    }
    const meetingUrl = calendarEvent.meetUrl;
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        event_type_id: eventTypeId,
        primary_admin_id: adminId,
        guest_name: name,
        guest_email: email,
        guest_phone: guestPhone
          ? String(guestPhone).trim()
          : null,
        start_at: start.toISOString(),
        end_at: end.toISOString(),
        guest_timezone: String(guestTimezone),
        guest_notes: guestNotes
          ? String(guestNotes).trim()
          : null,
        status: "confirmed",
        meeting_type: "giftgrid_video",
        meeting_url: meetingUrl,
        cal_meeting_url: meetingUrl,
        google_event_id: calendarEvent.eventId,
        booked_call_token: bookedCallToken,
        cancellation_token: token(),
        reschedule_token: token(),
      })
      .select(
        "id, start_at, end_at, guest_name, guest_email, booked_call_token"
      )
      .single();

    if (error) {
      if (
        error.message
          .toLowerCase()
          .includes("no_overlap")
      ) {
        return NextResponse.json(
          {
            error:
              "That time was just booked. Please choose another slot.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.degiftgrid.com").replace(/\/$/, "");
    const humanStart = new Intl.DateTimeFormat("en", { dateStyle: "full", timeStyle: "short", timeZone: String(guestTimezone) }).format(start);
    const humanEnd = new Intl.DateTimeFormat("en", { timeStyle: "short", timeZone: String(guestTimezone) }).format(end);
    const { data: hostProfile } = await supabase.from("profiles").select("email,full_name").eq("id", admin.profile_id).maybeSingle();
    const bookedCallUrl = `${site}/call/${booking.booked_call_token}`;

    try {
      await Promise.all([
        sendGuestBookingEmail({ guestName: name, guestEmail: email, adminName: admin.display_name || "GiftGrid Team", startTime: humanStart, endTime: humanEnd, timezone: String(guestTimezone), bookedCallUrl, meetingUrl, bookingUid: booking.id }),
        ...(hostProfile?.email ? [sendAdminBookingEmail({ adminEmail: hostProfile.email, adminName: hostProfile.full_name || admin.display_name || "GiftGrid Team", guestName: name, guestEmail: email, startTime: humanStart, endTime: humanEnd, timezone: String(guestTimezone), adminUrl: `${site}/admin/calls`, bookingUid: booking.id })] : []),
      ]);
    } catch (emailError) {
      console.error("Native booking email failed:", emailError);
    }

    return NextResponse.json({
      ok: true,
      id: booking.id,
      token: booking.booked_call_token,
      startAt: booking.start_at,
      endAt: booking.end_at,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create booking.",
      },
      { status: 500 }
    );
  }
}
