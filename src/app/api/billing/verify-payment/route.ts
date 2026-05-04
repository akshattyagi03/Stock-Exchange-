import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AuthOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(AuthOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    await dbConnect();

    await UserModel.findByIdAndUpdate(session.user._id, { tier: "premium" });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Razorpay verify payment error:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
