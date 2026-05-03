import { NextResponse } from "next/server"
import axios from "axios"
import { redis, connectRedis } from "@/lib/redis"

const CACHE_KEY = "markets:top_stocks"
const CACHE_TTL = 5

const STOCKS = [
  { key: "NSE_EQ|INE009A01021", symbol: "RELIANCE" },
  { key: "NSE_EQ|INE467B01029", symbol: "TCS" },
  { key: "NSE_EQ|INE040A01034", symbol: "HDFCBANK" },
  { key: "NSE_EQ|INE002A01018", symbol: "INFY" },
]

export async function GET() {
  try {
    await connectRedis()

    // 🔹 1. Check cache
    const cached = await redis.get(CACHE_KEY)
    if (cached) {
      return NextResponse.json({
        stocks: JSON.parse(cached),
        source: "cache",
      })
    }

    const accessToken = process.env.UPSTOX_ACCESS_TOKEN

    // 🔹 2. Fetch from Upstox
    const response = await axios.get(
      "https://api.upstox.com/v2/market-quote/quotes",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          instrument_key: STOCKS.map(s => s.key).join(","),
        },
      }
    )

    const rawData = response.data.data

    // 🔹 3. Transform
    const formattedStocks = Object.entries(rawData).map(
      ([instrumentKey, stock]: [string, any]) => {
        const lastPrice = stock.last_price
        const netChange = stock.net_change
        const previousClose = lastPrice - netChange

        const changePercent =
          previousClose !== 0
            ? (netChange / previousClose) * 100
            : 0

        return {
          instrumentKey,
          symbol: stock.symbol,
          name: stock.name,
          price: Number(lastPrice.toFixed(2)),
          change: Number(changePercent.toFixed(2)),
          changeValue: Number(netChange.toFixed(2)),
        }
      }
    )

    // 🔹 4. Sort (important for UI)
    formattedStocks.sort((a, b) => b.change - a.change)

    // 🔹 5. Cache
    await redis.set(CACHE_KEY, JSON.stringify(formattedStocks), {
      EX: CACHE_TTL,
    })

    return NextResponse.json({
      stocks: formattedStocks,
      source: "api",
    })

  } catch (error: any) {
    console.error("Markets Error:", error.response?.data || error.message)

    // 🔹 Fallback to cache if available
    const cached = await redis.get(CACHE_KEY)
    if (cached) {
      return NextResponse.json({
        stocks: JSON.parse(cached),
        source: "stale-cache",
      })
    }

    return NextResponse.json(
      { message: "Failed to fetch market data" },
      { status: 500 }
    )
  }
}