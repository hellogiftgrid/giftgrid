import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function parseTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const adminId = searchParams.get("adminId");
    const eventTypeId = searchParams.get("eventTypeId");
    const date = searchParams.get("date");
    const timezone = searchParams.get("timezone") || "UTC";

    if (!adminId || !eventTypeId || !date) {
      return NextResponse.json(
        { error: "Missing booking parameters." },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const [{ data: admin }, { data: eventType }] =
      await Promise.all([
        supabase
          .from("booking_admins")
          .select("*")
          .eq("id", adminId)
          .eq("active", true)
          .eq("accepting_bookings", true)
          .single(),

        supabase
          .from("booking_event_types")
          .select("*")
          .eq("id", eventTypeId)
          .eq("active", true)
          .eq("public_bookable", true)
          .single(),
      ]);

    if (!admin || !eventType) {
      return NextResponse.json(
        { error: "Booking option is unavailable." },
        { status: 404 }
      );
    }

    const dateObj = new Date(`${date}T12:00:00Z`);
    const dayOfWeek = dateObj.getUTCDay();

    const { data: availability } = await supabase
      .from("booking_availability")
      .select("*")
      .eq("booking_admin_id", adminId)
      .eq("day_of_week", dayOfWeek)
      .eq("active", true);

    if (!availability?.length) {
      return NextResponse.json({ slots: [] });
    }

    const startOfDay = new Date(`${date}T00:00:00Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const { data: existing } = await supabase
      .from("bookings")
      .select("start_at, end_at, primary_admin_id, secondary_admin_id")
      .or(
        `primary_admin_id.eq.${adminId},secondary_admin_id.eq.${adminId}`
      )
      .in("status", ["pending", "confirmed", "rescheduled"])
      .lt("start_at", endOfDay.toISOString())
      .gt("end_at", startOfDay.toISOString());

    const blocked = existing || [];
    const duration = eventType.duration_minutes;

    const slots: {
      start: string;
      end: string;
      label: string;
    }[] = [];

    for (const window of availability) {
      const startMinutes = parseTime(window.start_time);
      const endMinutes = parseTime(window.end_time);

      for (
        let minute = startMinutes;
        minute + duration <= endMinutes;
        minute += duration
      ) {
        const h = Math.floor(minute / 60);
        const m = minute % 60;

        const localString =
          `${date}T${pad(h)}:${pad(m)}:00`;

        /*
         * This first implementation treats the requested date/time
         * as the admin's configured schedule. The frontend displays
         * the returned UTC moment in the visitor's own timezone.
         *
         * Calendar-provider integration will later perform the
         * authoritative external free/busy check.
         */
        const start = new Date(
          `${date}T${pad(h)}:${pad(m)}:00Z`
        );

        const end = new Date(
          start.getTime() + duration * 60000
        );

        const overlaps = blocked.some((booking) => {
          const bookingStart = new Date(booking.start_at).getTime();
          const bookingEnd = new Date(booking.end_at).getTime();

          return (
            start.getTime() < bookingEnd &&
            end.getTime() > bookingStart
          );
        });

        if (!overlaps) {
          slots.push({
            start: start.toISOString(),
            end: end.toISOString(),
            label: localString,
          });
        }
      }
    }

    return NextResponse.json({
      slots,
      timezone,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to calculate availability.",
      },
      { status: 500 }
    );
  }
}
