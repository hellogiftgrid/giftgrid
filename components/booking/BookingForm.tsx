"use client";

import { useEffect, useMemo, useState } from "react";

type EventType = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  duration_minutes: number;
};

type Props = {
  adminId: string;
  adminSlug: string;
  adminTimezone: string;
  eventTypes: EventType[];
};

type Slot = {
  start: string;
  end: string;
  label: string;
};

function localTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

function formatSlot(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function BookingForm({
  adminId,
  adminSlug,
  adminTimezone,
  eventTypes,
}: Props) {
  const [eventTypeId, setEventTypeId] = useState(eventTypes[0]?.id || "");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");

  const timezone = useMemo(() => localTimezone(), []);

  const selectedEvent = eventTypes.find(
    (item) => item.id === eventTypeId
  );

  useEffect(() => {
    if (!date || !eventTypeId) {
      setSlots([]);
      return;
    }

    async function loadSlots() {
      setLoadingSlots(true);
      setError("");

      try {
        const query = new URLSearchParams({
          adminId,
          eventTypeId,
          date,
          timezone,
        });

        const response = await fetch(
          `/api/bookings/slots?${query.toString()}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load available times.");
        }

        setSlots(data.slots || []);
      } catch (err) {
        setSlots([]);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load available times."
        );
      } finally {
        setLoadingSlots(false);
      }
    }

    loadSlots();
  }, [adminId, eventTypeId, date, timezone]);

  async function submitBooking(event: React.FormEvent) {
    event.preventDefault();

    if (!selectedSlot) {
      setError("Choose a time first.");
      return;
    }

    setBooking(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId,
          eventTypeId,
          startAt: selectedSlot,
          guestName,
          guestEmail,
          guestPhone,
          guestNotes: notes,
          guestTimezone: timezone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Booking failed.");
      }

      window.location.href = `/book/${adminSlug}/confirmation?booking=${data.id}`;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Booking failed."
      );
    } finally {
      setBooking(false);
    }
  }

  const minDate = new Date();
  minDate.setMinutes(minDate.getMinutes() + 30);

  return (
    <div>
      <div>
        <h2 className="text-lg font-bold text-slate-950">
          Choose your call
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Times are shown in your local timezone:{" "}
          <strong>{timezone}</strong>
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {eventTypes.map((event) => (
          <button
            key={event.id}
            type="button"
            onClick={() => {
              setEventTypeId(event.id);
              setSelectedSlot("");
            }}
            className={`rounded-2xl border p-4 text-left transition ${
              event.id === eventTypeId
                ? "border-[#4F46E5] bg-indigo-50 ring-1 ring-[#4F46E5]"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div className="text-base font-bold text-slate-950">
              {event.duration_minutes} min
            </div>

            <div className="mt-1 text-sm font-semibold text-slate-700">
              {event.name}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-7">
        <label className="text-sm font-bold text-slate-700">
          Choose a date
        </label>

        <input
          type="date"
          value={date}
          min={minDate.toISOString().slice(0, 10)}
          onChange={(event) => {
            setDate(event.target.value);
            setSelectedSlot("");
          }}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {date && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-700">
              Available times
            </label>

            <span className="text-xs text-slate-400">
              Admin timezone: {adminTimezone}
            </span>
          </div>

          {loadingSlots ? (
            <div className="mt-4 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
              Checking availability...
            </div>
          ) : !slots.length ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
              No available times on this date.
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {slots.map((slot) => (
                <button
                  key={slot.start}
                  type="button"
                  onClick={() => setSelectedSlot(slot.start)}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                    selectedSlot === slot.start
                      ? "border-[#4F46E5] bg-[#4F46E5] text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50"
                  }`}
                >
                  {formatSlot(slot.start)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <form onSubmit={submitBooking} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-bold text-slate-700">
            Your name
          </label>

          <input
            required
            value={guestName}
            onChange={(event) => setGuestName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5]"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">
            Email
          </label>

          <input
            required
            type="email"
            value={guestEmail}
            onChange={(event) => setGuestEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5]"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">
            Phone
            <span className="ml-1 font-normal text-slate-400">
              optional
            </span>
          </label>

          <input
            value={guestPhone}
            onChange={(event) => setGuestPhone(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5]"
            placeholder="+234..."
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">
            What would you like help with?
          </label>

          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5]"
            placeholder="Tell us briefly what you'd like to discuss."
          />
        </div>

        {selectedSlot && (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm">
            <div className="font-bold text-slate-950">
              {selectedEvent?.name}
            </div>

            <div className="mt-1 text-slate-500">
              {formatSlot(selectedSlot)} · {timezone}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={booking || !selectedSlot}
          className="w-full rounded-xl bg-[#4F46E5] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {booking ? "Booking..." : "Confirm booking"}
        </button>
      </form>
    </div>
  );
}
