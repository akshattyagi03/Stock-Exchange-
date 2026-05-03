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
  const { name } = await req.json();

  if (!name || name.trim() === "") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    const existingCount = await Watchlist.countDocuments({ userId });
    if (existingCount >= 10) {
      return NextResponse.json({ error: "Maximum number of watchlists reached" }, { status: 400 });
    }

    const newWatchlist = await Watchlist.create({
      userId,
      name: name.trim(),
      stocks: []
    });

    return NextResponse.json({ message: "Watchlist created", watchlist: newWatchlist });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Watchlist with this name already exists" }, { status: 400 });
    }
    console.error("Create Watchlist Error:", error);
    return NextResponse.json({ error: "Failed to create watchlist" }, { status: 500 });
  }
}
