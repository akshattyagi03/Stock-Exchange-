import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AuthOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { z } from "zod";

const tradingSchema = z.object({
  defaultOrderType: z.enum(["market", "limit"]).optional(),
  defaultQuantity: z.number().min(1).optional(),
  defaultExchange: z.enum(["NSE", "BSE"]).optional(),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(AuthOptions);
  if (!session?.user?._id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const body = await req.json();
    const parsed = tradingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid trading preferences data" }, { status: 400 });
    }

    await UserModel.findByIdAndUpdate(session.user._id, { $set: parsed.data });

    return NextResponse.json({ message: "Trading preferences updated successfully" });
  } catch (error) {
    console.error("Trading Prefs API Error:", error);
    return NextResponse.json({ error: "Failed to update trading preferences" }, { status: 500 });
  }
}
