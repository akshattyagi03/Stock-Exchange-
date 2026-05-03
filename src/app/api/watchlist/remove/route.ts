import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AuthOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { Watchlist } from "@/models/Watchlist";

export async function DELETE(req: NextRequest) {
  await dbConnect();

  const session = await getServerSession(AuthOptions);
  if (!session?.user?._id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user._id;

  const { watchlistId, instrumentKey } = await req.json();

  if (!instrumentKey) {
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
      return NextResponse.json(
        { error: "Watchlist not found" },
        { status: 404 }
      );
    }

    targetWatchlist.stocks = targetWatchlist.stocks.filter(
      (item: any) => item.instrumentKey !== instrumentKey
    );

    await targetWatchlist.save();

    return NextResponse.json({
      message: "Removed from watchlist",
      watchlist: targetWatchlist,
    });
  } catch (error) {
    console.error("Remove Watchlist Error:", error);

    return NextResponse.json(
      { error: "Failed to remove from watchlist" },
      { status: 500 }
    );
  }
}