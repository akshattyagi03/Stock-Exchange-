import { NextResponse } from "next/server"
import axios from "axios"
import { redis, connectRedis } from "@/lib/redis"

const CACHE_KEY = "markets:top_stocks"
const CACHE_TTL = 30 // seconds

export async function GET() {
  try {
    await connectRedis()
    const cached = await redis.get(CACHE_KEY)
    if (cached) {
      console.log("Serving from Redis cache")
      return NextResponse.json({
        stocks: JSON.parse(cached),
      })
    }
    const accessToken = process.env.UPSTOX_ACCESS_TOKEN

    const instrumentKeys = [
      "NSE_EQ|INE009A01021",
      "NSE_EQ|INE467B01029",
      "NSE_EQ|INE040A01034",
      "NSE_EQ|INE002A01018",
    ]

    const response = await axios.get(
      "https://api.upstox.com/v2/market-quote/quotes",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          instrument_key: instrumentKeys.join(","),
        },
      }
    )

    const rawData = response.data.data

    const formattedStocks = Object.entries(rawData).map(
      ([instrumentKey, stock]: [string, any]) => {
        const lastPrice = stock.last_price
        const prevClose = stock.ohlc?.close || 0

        const change =
          prevClose !== 0
            ? ((lastPrice - prevClose) / prevClose) * 100
            : 0

        return {
          instrumentKey,
          symbol: stock.symbol,
          name: stock.name,
          price: lastPrice,
          change: Number(change.toFixed(2)),
        }
      }
    )
    await redis.set(CACHE_KEY, JSON.stringify(formattedStocks), {
      EX: CACHE_TTL,
    })

    console.log("Stored in Redis")

    return NextResponse.json({ stocks: formattedStocks })
  } catch (error: any) {
    console.error("Markets Error:", error.response?.data || error.message)
    return NextResponse.json(
      { message: "Failed to fetch market data" },
      { status: 500 }
    )
  }
}