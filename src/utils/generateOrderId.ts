import crypto from "crypto";

export function generateOrderId(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");

  const datePart = `${year}${month}${day}`;

  const randomNumber = crypto.randomInt(10000, 100000); 

  return `ORD-${datePart}-${randomNumber}`;
}