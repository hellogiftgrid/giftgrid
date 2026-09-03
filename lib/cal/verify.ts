import crypto from "node:crypto";

export function verifyCalSignature(
  body: string,
  signature: string | null,
  secret: string
) {
  if (!signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expected, "utf8")
    );
  } catch {
    return false;
  }
}
