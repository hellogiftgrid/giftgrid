import { Resend } from "resend";

function resend() {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return new Resend(key);
}

function from() {
  return (
    process.env.RESEND_FROM_EMAIL ||
    "GiftGrid <support@degiftgrid.com>"
  );
}

function esc(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendGuestBookingEmail(input: {
  guestName: string;
  guestEmail: string;
  adminName: string;
  startTime: string;
  endTime: string;
  timezone: string;
  bookedCallUrl: string;
  meetingUrl: string | null;
  bookingUid: string;
}) {
  const client = resend();

  const joinUrl = input.bookedCallUrl;

  return client.emails.send(
    {
      from: from(),
      to: [input.guestEmail],
      subject: `Your GiftGrid call is confirmed — ${input.adminName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#0f172a">
          <h1>Your GiftGrid call is confirmed</h1>
          <p>Hello ${esc(input.guestName)},</p>

          <p>
            Your GiftGrid appointment is confirmed.
            You will be meeting with <strong>${esc(input.adminName)}</strong>.
          </p>

          <div style="padding:20px;background:#f8fafc;border-radius:16px;margin:24px 0">
            <p><strong>Date/time:</strong> ${esc(input.startTime)} – ${esc(input.endTime)}</p>
            <p><strong>Timezone:</strong> ${esc(input.timezone)}</p>
            <p><strong>Booking:</strong> ${esc(input.bookingUid)}</p>
          </div>

          <p>
            <a href="${esc(joinUrl)}"
              style="background:#4F46E5;color:#fff;text-decoration:none;padding:13px 20px;border-radius:10px;font-weight:700">
              Open your GiftGrid call
            </a>
          </p>

          <p style="margin-top:28px;color:#64748b;font-size:13px">
            GiftGrid · support@degiftgrid.com
          </p>
        </div>
      `,
    },
    {
      idempotencyKey: `giftgrid-guest-booking-${input.bookingUid}`,
    }
  );
}

export async function sendAdminBookingEmail(input: {
  adminEmail: string;
  adminName: string;
  guestName: string;
  guestEmail: string;
  startTime: string;
  endTime: string;
  timezone: string;
  adminUrl: string;
  bookingUid: string;
}) {
  const client = resend();

  return client.emails.send(
    {
      from: from(),
      to: [input.adminEmail],
      subject: `New GiftGrid booking — ${input.guestName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#0f172a">
          <h1>New GiftGrid booking</h1>

          <p>Hello ${esc(input.adminName)},</p>

          <div style="padding:20px;background:#f8fafc;border-radius:16px;margin:24px 0">
            <p><strong>Guest:</strong> ${esc(input.guestName)}</p>
            <p><strong>Email:</strong> ${esc(input.guestEmail)}</p>
            <p><strong>Date/time:</strong> ${esc(input.startTime)} – ${esc(input.endTime)}</p>
            <p><strong>Timezone:</strong> ${esc(input.timezone)}</p>
            <p><strong>Booking:</strong> ${esc(input.bookingUid)}</p>
          </div>

          <p>
            <a href="${esc(input.adminUrl)}"
              style="background:#4F46E5;color:#fff;text-decoration:none;padding:13px 20px;border-radius:10px;font-weight:700">
              Open GiftGrid Calls
            </a>
          </p>
        </div>
      `,
    },
    {
      idempotencyKey: `giftgrid-admin-booking-${input.bookingUid}-${input.adminEmail}`,
    }
  );
}
