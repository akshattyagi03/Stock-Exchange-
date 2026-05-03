import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AuthOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { Watchlist } from "@/models/Watchlist";

export async function GET() {
  const session = await getServerSession(AuthOptions);

  if (!session?.user?._id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const watchlists = await Watchlist.find({ userId: session.user._id }).sort({ createdAt: 1 });

    if (watchlists.length === 0) {
      const defaultWatchlist = await Watchlist.create({
        userId: session.user._id,
        name: "My Watchlist",
        stocks: []
      });
      return NextResponse.json({ watchlists: [defaultWatchlist] });
    }

    return NextResponse.json({ watchlists });
  } catch (error) {
    console.error("Get Watchlists Error:", error);
    return NextResponse.json({ error: "Failed to fetch watchlists" }, { status: 500 });
  }
}
