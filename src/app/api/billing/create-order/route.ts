import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AuthOptions } from "@/app/api/auth/[...nextauth]/options";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST() {
  try {
    const session = await getServerSession(AuthOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await razorpay.orders.create({
      amount: 29900,
      currency: "INR",
      receipt: `receipt_${session.user._id}_${Date.now()}`,
      notes: {
        userId: session.user._id,
        plan: "premium",
      },
    });

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error("Razorpay create order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
