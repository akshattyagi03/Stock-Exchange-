import crypto from "crypto";

export function generateVerificationCode(): string {
  const code = crypto.randomInt(100000, 1000000);
  return code.toString();
}