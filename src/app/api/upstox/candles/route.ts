import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const instrumentKey = req.nextUrl.searchParams.get("instrumentKey");
  const interval = req.nextUrl.searchParams.get("interval") || "day";
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");

  if (!instrumentKey) {
    return NextResponse.json(
      { error: "Instrument key required" },
      { status: 400 }
    );
  }

  if (!from || !to) {
    return NextResponse.json(
      { error: "From and To dates are required (YYYY-MM-DD)" },
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
      `https://api.upstox.com/v2/historical-candle/${instrumentKey}/${interval}/${to}/${from}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTOX_ACCESS_TOKEN}`,
        },
      }
    );

    if (response.status === 401) {
      return NextResponse.json(
        { error: "Upstox token expired. Regenerate access token." },
        { status: 401 }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Upstox Candle Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch candle data" },
      { status: 500 }
    );
  }
}