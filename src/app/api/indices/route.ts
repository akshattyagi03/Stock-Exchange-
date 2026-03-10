import { NextResponse } from "next/server"
import { getIndexPrice } from "@/lib/upstox"

export async function GET() {
  try {
    const token = process.env.UPSTOX_ACCESS_TOKEN!

    const indices = [
      { symbol: "NIFTY50", name: "Nifty 50", key: "NSE_INDEX|Nifty 50" },
      { symbol: "SENSEX", name: "BSE Sensex", key: "BSE_INDEX|SENSEX" },
      { symbol: "BANKNIFTY", name: "Bank Nifty", key: "NSE_INDEX|Nifty Bank" },
      { symbol: "NIFTYIT", name: "Nifty IT", key: "NSE_INDEX|Nifty IT" }
    ]

    const result = []

    for (const index of indices) {
      console.log("Fetching:", index.key)
      const data = await getIndexPrice(index.key, token)
      console.log("Response:", data)
      result.push({
        symbol: index.symbol,
        name: index.name,
        value: data?.last_price ?? 0,
        change: 0,
        points: 0
      })
    }

    return NextResponse.json({ indices: result })

  } catch (error) {
    console.error("Indices API error:", error)

    return NextResponse.json(
      { indices: [] },
      { status: 500 }
    )
  }
}