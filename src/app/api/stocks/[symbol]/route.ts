import axios from "axios"
import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params
    const { searchParams } = new URL(req.url)

    const range = searchParams.get("range") || "1M"
    const cacheKey = `stock:${symbol}:${range}`

    /* ---------------- REDIS CACHE ---------------- */

    const cached = await redis.get(cacheKey)
    if (cached) return NextResponse.json(JSON.parse(cached))

    const accessToken = process.env.UPSTOX_ACCESS_TOKEN

    const instrumentMap: Record<string, string> = {
      INFY: "NSE_EQ|INE009A01021",
      TCS: "NSE_EQ|INE467B01029",
      HDFCBANK: "NSE_EQ|INE040A01034",
      RELIANCE: "NSE_EQ|INE002A01018",
    }

    const instrumentKey = instrumentMap[symbol]

    if (!instrumentKey) {
      return NextResponse.json({ error: "Invalid symbol" }, { status: 400 })
    }

    const today = new Date()
    let fromDate = new Date()

    let url = ""

    /* ---------------- RANGE LOGIC ---------------- */

    if (range === "1D") {
      url = `https://api.upstox.com/v3/historical-candle/intraday/${encodeURIComponent(
        instrumentKey
      )}/minutes/5`
    }

    else if (range === "1W") {
      fromDate.setDate(today.getDate() - 7)

      url = `https://api.upstox.com/v3/historical-candle/${encodeURIComponent(
        instrumentKey
      )}/minutes/15/${today.toISOString().split("T")[0]}/${fromDate
        .toISOString()
        .split("T")[0]}`
    }

    else if (range === "1M") {
      fromDate.setMonth(today.getMonth() - 1)

      url = `https://api.upstox.com/v3/historical-candle/${encodeURIComponent(
        instrumentKey
      )}/minutes/60/${today.toISOString().split("T")[0]}/${fromDate
        .toISOString()
        .split("T")[0]}`
    }

    else {
      fromDate.setFullYear(today.getFullYear() - 1)

      url = `https://api.upstox.com/v2/historical-candle/${encodeURIComponent(
        instrumentKey
      )}/day/${today.toISOString().split("T")[0]}/${fromDate
        .toISOString()
        .split("T")[0]}`
    }

    /* ---------------- FETCH FROM UPSTOX ---------------- */

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })

    const candles = response.data.data.candles

    const chartData = candles.map((c: any) => ({
      time: Math.floor(new Date(c[0]).getTime() / 1000),
      open: Number(c[1]),
      high: Number(c[2]),
      low: Number(c[3]),
      close: Number(c[4]),
      volume: Number(c[5]),
    }))

    const result = chartData.reverse()

    await redis.set(cacheKey, JSON.stringify(result), { EX: 30 })

    return NextResponse.json(result)

  } catch (error: any) {
    console.error("Stocks API Error:", error.response?.data || error.message)

    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 500 }
    )
  }
}