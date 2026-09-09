import { sendEmail } from "@/lib/email/provider";

export async function sendGiftGridEmail({
  to,
  subject,
  html,
  replyTo = "support@degiftgrid.com",
}: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  return sendEmail({
    to,
    subject,
    html,
    replyTo,
  });
}
