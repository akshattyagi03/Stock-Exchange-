import crypto from "crypto";

export function generateOrderId(): string {
  const timestamp = Date.now(); 
  const random = crypto.randomBytes(4).toString("hex"); 

  return `ORD-${timestamp}-${random}`;
}