import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail =
  process.env.RESEND_FROM_EMAIL || "no-reply@degiftgrid.com";

if (!apiKey) {
  throw new Error("RESEND_API_KEY is not configured");
}

const resend = new Resend(apiKey);

export async function sendGiftGridEmail({
  to,
  subject,
  html,
  replyTo = "hello@degiftgrid.com",
}: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  return resend.emails.send({
    from: `GiftGrid <${fromEmail}>`,
    to,
    subject,
    html,
    replyTo,
  });
}
