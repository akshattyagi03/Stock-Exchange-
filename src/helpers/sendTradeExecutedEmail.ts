import { resend } from "@/lib/resend";
import TradeExecutedEmail from "../../emails/TradeExecutedEmail";

interface TradeExecutedParams {
  email: string;
  name: string;
  orderId: string;
  stockName: string;
  orderType: "buy" | "sell";
  quantity: number;
  executedPrice: number;
  executedAt: Date;
}

export async function sendTradeExecutedEmail({
  email,
  name,
  orderId,
  stockName,
  orderType,
  quantity,
  executedPrice,
  executedAt,
}: TradeExecutedParams) {
  const totalValue = executedPrice * quantity;
  const executedAtStr = executedAt.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  try {
    await resend.emails.send({
      from: "TradeX <onboarding@resend.dev>",
      to: email,
      subject: `STOCKS EX | ${orderType.toUpperCase()} Order Executed — ${stockName}`,
      react: TradeExecutedEmail({
        name,
        orderId,
        stockName,
        orderType,
        quantity,
        executedPrice,
        totalValue,
        executedAt: executedAtStr,
      }),
    });
  } catch (error) {
    console.error("[sendTradeExecutedEmail] Failed to send email:", error);
  }
}
