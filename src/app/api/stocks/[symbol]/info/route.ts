import { NextResponse } from "next/server"
import { getStockQuote } from "@/lib/upstox"
import { redis, connectRedis } from "@/lib/redis"

const instrumentMap: Record<string, string> = {
  RELIANCE: "NSE_EQ|INE002A01018",
  TCS: "NSE_EQ|INE467B01029",
  INFY: "NSE_EQ|INE009A01021",
  HDFCBANK: "NSE_EQ|INE040A01034",
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    await connectRedis()

    const { symbol } = await params
    const upperSymbol = symbol.toUpperCase()
    const cacheKey = `stock:info:${upperSymbol}`

    const cached = await redis.get(cacheKey)
    if (cached) {
      return NextResponse.json(JSON.parse(cached))
    }

    const instrumentKey = instrumentMap[upperSymbol]

    if (!instrumentKey) {
      return NextResponse.json({ error: "Invalid symbol" }, { status: 400 })
    }

    const accessToken = process.env.UPSTOX_ACCESS_TOKEN!

    const quote = await getStockQuote(instrumentKey, accessToken)

    if (!quote) {
      return NextResponse.json(
        { error: "No quote data returned" },
        { status: 500 }
      )
    }

    const netChange = quote.net_change ?? 0
    const close = quote.ohlc?.close ?? 0

    const changePercent =
      close !== 0 ? ((netChange / close) * 100).toFixed(2) : 0

    const result = {
      price: quote.last_price ?? 0,
      open: quote.ohlc?.open ?? 0,
      high: quote.ohlc?.high ?? 0,
      low: quote.ohlc?.low ?? 0,
      close: close,
      volume: quote.volume ?? 0,
      change: netChange,
      changePercent: changePercent,
    }

    await redis.set(cacheKey, JSON.stringify(result), { EX: 30 })

    return NextResponse.json(result)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Failed to fetch stock info" },
      { status: 500 }
    )
  }
}