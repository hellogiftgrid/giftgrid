type BookingEmailData = {
  guestName: string;
  adminName: string;
  title: string;
  startAt: string;
  endAt: string;
  timezone: string;
  joinUrl?: string | null;
};

function esc(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(
  value: string,
  timezone: string
) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone || "UTC",
  }).format(new Date(value));
}

export function bookingConfirmationEmail(
  data: BookingEmailData
) {
  const joinButton = data.joinUrl
    ? `
      <a
        href="${esc(data.joinUrl)}"
        style="
          display:inline-block;
          background:#4F46E5;
          color:#ffffff;
          text-decoration:none;
          padding:14px 24px;
          border-radius:10px;
          font-weight:700;
          margin-top:12px;
        "
      >
        Join Call
      </a>
    `
    : "";

  return `
<!doctype html>
<html>
<body style="margin:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <div style="padding:40px 16px;">
    <div style="max-width:580px;margin:auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;padding:36px;">

      <div style="color:#4F46E5;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">
        GiftGrid
      </div>

      <h1 style="font-size:28px;line-height:1.3;margin:14px 0;">
        Your call is confirmed
      </h1>

      <p style="font-size:15px;line-height:1.7;color:#4b5563;">
        Hi ${esc(data.guestName)}, your GiftGrid call has been booked successfully.
      </p>

      <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:20px;margin:24px 0;">
        <strong>${esc(data.title)}</strong><br>
        ${esc(data.adminName)}<br>
        ${esc(formatDate(data.startAt, data.timezone))}<br>
        <span style="color:#64748b;">
          ${esc(data.timezone)}
        </span>
      </div>

      ${joinButton}

      <p style="margin-top:28px;color:#64748b;font-size:13px;line-height:1.7;">
        If you need to change the appointment, use the rescheduling or cancellation
        options provided by Calendly.
      </p>

      <div style="border-top:1px solid #e5e7eb;margin-top:30px;padding-top:20px;color:#94a3b8;font-size:11px;">
        © 2019 GiftGrid · degiftgrid.com
      </div>

    </div>
  </div>
</body>
</html>
`;
}
