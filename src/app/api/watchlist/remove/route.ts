import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function DELETE(req: NextRequest) {
  await dbConnect();

  const { userId, instrumentKey } = await req.json();

  if (!userId || !instrumentKey) {
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

    user.watchlist = user.watchlist.filter(
      (item: any) => item.instrumentKey !== instrumentKey
    );

    await user.save();

    return NextResponse.json({
      message: "Removed from watchlist",
      watchlist: user.watchlist,
    });
  } catch (error) {
    console.error("Remove Watchlist Error:", error);

    return NextResponse.json(
      { error: "Failed to remove from watchlist" },
      { status: 500 }
    );
  }
}