import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const symbols = req.nextUrl.searchParams.get("symbols");

  if (!symbols) {
    return NextResponse.json(
      { error: "Symbols are required" },
      { status: 400 }
    );
  }

  if (!process.env.UPSTOX_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "Upstox access token not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.upstox.com/v2/market-quote/ltp?symbol=${symbols}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTOX_ACCESS_TOKEN}`,
        },
      }
    );

    // 🔥 Handle expired token
    if (response.status === 401) {
      return NextResponse.json(
        { error: "Upstox token expired. Regenerate access token." },
        { status: 401 }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Upstox Watchlist Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch watchlist" },
      { status: 500 }
    );
  }
}