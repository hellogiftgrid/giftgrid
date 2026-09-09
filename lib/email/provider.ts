import { Resend } from "resend";

type EmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  idempotencyKey?: string;
};

function fromEmail() {
  return process.env.SENDER_FROM_EMAIL || process.env.BREVO_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "no-reply@degiftgrid.com";
}

function fromName() {
  return process.env.SENDER_FROM_NAME || process.env.BREVO_FROM_NAME || "GiftGrid";
}

export async function sendEmail(input: EmailInput) {
  const recipients = Array.isArray(input.to) ? input.to : [input.to];
  const replyTo = input.replyTo || "support@degiftgrid.com";

  if (process.env.SENDER_API_TOKEN) {
    const responses = await Promise.all(
      recipients.map(async (email) => {
        const response = await fetch("https://api.sender.net/v2/message/send", {
          method: "POST",
          headers: {
            accept: "application/json",
            authorization: `Bearer ${process.env.SENDER_API_TOKEN}`,
            "content-type": "application/json",
            ...(input.idempotencyKey ? { "X-Message-Id": input.idempotencyKey } : {}),
          },
          body: JSON.stringify({
            from: { email: fromEmail(), name: fromName() },
            to: { email },
            subject: input.subject,
            html: input.html,
            headers: { "Reply-To": replyTo },
          }),
          cache: "no-store",
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(`Sender email failed (${response.status}): ${payload?.message || "unknown error"}`);
        }
        return payload;
      }),
    );
    return responses.length === 1 ? responses[0] : responses;
  }

  if (process.env.BREVO_API_KEY) {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: fromEmail(), name: fromName() },
        to: recipients.map((email) => ({ email })),
        replyTo: { email: replyTo },
        subject: input.subject,
        htmlContent: input.html,
        ...(input.idempotencyKey ? { headers: { "X-Message-Id": input.idempotencyKey } } : {}),
      }),
      cache: "no-store",
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(`Brevo email failed (${response.status}): ${payload?.message || "unknown error"}`);
    }

    return payload;
  }

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send(
      {
        from: `${fromName()} <${fromEmail()}>`,
        replyTo,
        to: recipients,
        subject: input.subject,
        html: input.html,
      },
      input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
    );

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data;
  }

  throw new Error("No email provider is configured. Add SENDER_API_TOKEN, BREVO_API_KEY, or RESEND_API_KEY.");
}
