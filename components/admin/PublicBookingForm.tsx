"use client";

import { useEffect, useMemo, useState } from "react";

type EventType = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  duration_minutes: number;
};

type Slot = {
  start: string;
  end: string;
};

function browserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function PublicBookingForm({
  adminId,
  adminSlug,
  adminTimezone,
  eventTypes,
}: {
  adminId: string;
  adminSlug: string;
  adminTimezone: string;
  eventTypes: EventType[];
}) {
  const timezone = useMemo(browserTimezone, []);

  const [eventTypeId, setEventTypeId] = useState(
    eventTypes[0]?.id || ""
  );
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!date || !eventTypeId) {
      setSlots([]);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const qs = new URLSearchParams({
          adminId,
          eventTypeId,
          date,
          timezone,
        });

        const response = await fetch(
          `/api/bookings/slots?${qs.toString()}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load available times."
          );
        }

        if (!cancelled) {
          setSlots(data.slots || []);
        }
      } catch (err) {
        if (!cancelled) {
          setSlots([]);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load available times."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [adminId, eventTypeId, date, timezone]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!selected) {
      setError("Choose an available time.");
      return;
    }

    setBooking(true);
    setError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId,
          eventTypeId,
          startAt: selected,
          guestName: name,
          guestEmail: email,
          guestPhone: phone,
          guestNotes: notes,
          guestTimezone: timezone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to book the call.");
      }

      window.location.href =
        `/book/${adminSlug}/confirmation?booking=${data.id}`;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to book the call."
      );
    } finally {
      setBooking(false);
    }
  }

  const minDate = new Date();
  minDate.setMinutes(minDate.getMinutes() + 30);

  return (
    <form onSubmit={submit} className="mt-8 space-y-7">
      <div>
        <div className="text-sm font-bold text-slate-700">
          Call length
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {eventTypes.map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => {
                setEventTypeId(event.id);
                setSelected("");
              }}
              className={`rounded-2xl border p-4 text-left transition ${
                eventTypeId === event.id
                  ? "border-[#4F46E5] bg-indigo-50 ring-1 ring-[#4F46E5]"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="text-xl font-bold text-slate-950">
                {event.duration_minutes} min
              </div>

              <div className="mt-1 text-sm font-semibold text-slate-700">
                {event.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-bold text-slate-700">
          Date
        </label>

        <input
          required
          type="date"
          min={minDate.toISOString().slice(0, 10)}
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setSelected("");
          }}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5]"
        />

        <div className="mt-2 text-xs text-slate-400">
          Your timezone: {timezone}
        </div>
      </div>

      {date && (
        <div>
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-slate-700">
              Available times
            </div>

            <div className="text-xs text-slate-400">
              Schedule: {adminTimezone}
            </div>
          </div>

          {loading ? (
            <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              Checking availability...
            </div>
          ) : slots.length === 0 ? (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              No times are available on this date.
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {slots.map((slot) => (
                <button
                  key={slot.start}
                  type="button"
                  onClick={() => setSelected(slot.start)}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold ${
                    selected === slot.start
                      ? "border-[#4F46E5] bg-[#4F46E5] text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-indigo-50"
                  }`}
                >
                  {formatTime(slot.start)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-bold text-slate-700">
            Name
          </label>

          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5]"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">
            Email
          </label>

          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5]"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-bold text-slate-700">
          Phone
          <span className="ml-1 font-normal text-slate-400">
            optional
          </span>
        </label>

        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5]"
          placeholder="+234..."
        />
      </div>

      <div>
        <label className="text-sm font-bold text-slate-700">
          What would you like to discuss?
        </label>

        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5]"
          placeholder="Briefly tell us what you need help with."
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={booking || !selected}
        className="w-full rounded-xl bg-[#4F46E5] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {booking ? "Booking..." : "Confirm booking"}
      </button>

      <p className="text-center text-xs text-slate-400">
        No GiftGrid account is required.
      </p>
    </form>
  );
}
