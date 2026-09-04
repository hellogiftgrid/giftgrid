import { Resend } from "resend";

const fromEmail =
  process.env.RESEND_FROM_EMAIL || "no-reply@degiftgrid.com";

let resendClient: Resend | null = null;

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

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
  return getResend().emails.send({
    from: `GiftGrid <${fromEmail}>`,
    to,
    subject,
    html,
    replyTo,
  });
}
