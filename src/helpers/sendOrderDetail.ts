import { resend } from "@/lib/resend";
import ExecutedOrderEmail from "../../emails/OrderDetail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendOrderDetail(
  email: string,
  name: string,
  symbol: string,
  orderType: "BUY" | "SELL",
  quantity: number,
  price: number,
  total: number,
  executedAt: string
): Promise<ApiResponse> {
  try {
    const { data, error } = await resend.emails.send({
      from: "StocksEx <onboarding@resend.dev>",
      to: email,
      subject: "STOCKS EX | Order Executed",
      react: ExecutedOrderEmail({
        name,
        symbol,
        orderType,
        quantity,
        price,
        total,
        executedAt,
      }),
    });

    if (error) {
      console.error("Resend error:", error);

      return {
        success: false,
        message: "Failed to send order detail email.",
      };
    }

    return {
      success: true,
      message: "Order detail email sent successfully",
    };
  } catch (emailError) {
    console.error("Unexpected email error:", emailError);

    return {
      success: false,
      message: "Failed to send order detail email.",
    };
  }
}