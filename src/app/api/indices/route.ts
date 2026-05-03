import { NextResponse } from "next/server"
import { getStockQuote } from "@/lib/upstox"

export async function GET() {
  try {
    const token = process.env.UPSTOX_ACCESS_TOKEN!

    const indices = [
      { symbol: "NIFTY50",   name: "Nifty 50",   key: "NSE_INDEX|Nifty 50" },
      { symbol: "SENSEX",    name: "BSE Sensex",  key: "BSE_INDEX|SENSEX" },
      { symbol: "BANKNIFTY", name: "Bank Nifty",  key: "NSE_INDEX|Nifty Bank" },
      { symbol: "NIFTYIT",   name: "Nifty IT",    key: "NSE_INDEX|Nifty IT" },
    ]

    const result = await Promise.all(
      indices.map(async (index) => {
        const data = await getStockQuote(index.key, token)
        const lastPrice = data?.last_price ?? 0
        const close = data?.ohlc?.close ?? 0
        const netChange = data?.net_change ?? 0
        const changePercent = close !== 0 ? parseFloat(((netChange / close) * 100).toFixed(2)) : 0

        return {
          symbol: index.symbol,
          name: index.name,
          value: lastPrice,
          change: changePercent,
          points: parseFloat(netChange.toFixed(2)),
        }
      })
    )

    return NextResponse.json({ indices: result })

  } catch (error) {
    console.error("Indices API error:", error)
    return NextResponse.json({ indices: [] }, { status: 500 })
  }
}