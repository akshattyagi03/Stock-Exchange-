import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AuthOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { Watchlist } from "@/models/Watchlist";

export async function POST(req: NextRequest) {
  await dbConnect();

  const session = await getServerSession(AuthOptions);
  if (!session?.user?._id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user._id;

  const { watchlistId, instrumentKey, symbol } = await req.json();

  if (!instrumentKey || !symbol) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    let targetWatchlist;
    if (watchlistId) {
      targetWatchlist = await Watchlist.findOne({ _id: watchlistId, userId });
    } else {
      targetWatchlist = await Watchlist.findOne({ userId });
    }

    if (!targetWatchlist) {
      targetWatchlist = await Watchlist.create({ userId, name: "My Watchlist", stocks: [] });
    }

    // Prevent duplicate
    const exists = targetWatchlist.stocks.some(
      (item: any) => item.instrumentKey === instrumentKey
    );

    if (exists) {
      return NextResponse.json(
        { error: "Stock already in watchlist" },
        { status: 400 }
      );
    }

    if (targetWatchlist.stocks.length >= 50) {
      return NextResponse.json(
        { error: "Watchlist is full (max 50 stocks)" },
        { status: 400 }
      );
    }

    targetWatchlist.stocks.push({
      instrumentKey,
      symbol,
      addedAt: new Date(),
    });

    await targetWatchlist.save();

    return NextResponse.json({
      message: "Added to watchlist",
      watchlist: targetWatchlist,
    });
  } catch (error) {
    console.error("Add Watchlist Error:", error);

    return NextResponse.json(
      { error: "Failed to add to watchlist" },
      { status: 500 }
    );
  }
}