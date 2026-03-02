import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function POST(req: NextRequest) {
  await dbConnect();

  const { userId, instrumentKey, symbol } = await req.json();

  if (!userId || !instrumentKey || !symbol) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent duplicate
    const exists = user.watchlist.some(
      (item: any) => item.instrumentKey === instrumentKey
    );

    if (exists) {
      return NextResponse.json(
        { error: "Stock already in watchlist" },
        { status: 400 }
      );
    }

    user.watchlist.push({
      instrumentKey,
      symbol,
      addedAt: new Date(),
    });

    await user.save();

    return NextResponse.json({
      message: "Added to watchlist",
      watchlist: user.watchlist,
    });
  } catch (error) {
    console.error("Add Watchlist Error:", error);

    return NextResponse.json(
      { error: "Failed to add to watchlist" },
      { status: 500 }
    );
  }
}