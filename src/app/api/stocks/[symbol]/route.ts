import axios from "axios"
import { NextResponse } from "next/server"
import { redis, connectRedis } from "@/lib/redis"
import { getInstrumentKeyBySymbol } from "@/lib/instruments"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    await connectRedis()

    const { symbol } = await params
    const upperSymbol = symbol.toUpperCase()
    const { searchParams } = new URL(req.url)

    const range = searchParams.get("range") || "1M"
    const dateParam = searchParams.get("date")
    const cacheKey = `stock:${upperSymbol}:${range}:${dateParam || "latest"}`

    const cached = await redis.get(cacheKey)
    if (cached) {
      return NextResponse.json(JSON.parse(cached))
    }

    const accessToken = process.env.UPSTOX_ACCESS_TOKEN
    const instrumentKey = getInstrumentKeyBySymbol(upperSymbol)

    if (!instrumentKey) {
      return NextResponse.json({ error: "Invalid symbol" }, { status: 400 })
    }

    const today = new Date()
    let fromDate = new Date()
    let url = ""

    if (range === "1D") {
      const targetDate = dateParam || today.toISOString().split("T")[0]
      const prevDate = new Date(targetDate)
      prevDate.setDate(prevDate.getDate() - 1)

      url = `https://api.upstox.com/v3/historical-candle/${encodeURIComponent(
        instrumentKey
      )}/minutes/5/${targetDate}/${prevDate.toISOString().split("T")[0]}`
    } else if (range === "1W") {
      fromDate.setDate(today.getDate() - 7)
      url = `https://api.upstox.com/v3/historical-candle/${encodeURIComponent(
        instrumentKey
      )}/minutes/15/${today.toISOString().split("T")[0]}/${fromDate.toISOString().split("T")[0]}`
    } else if (range === "1M") {
      fromDate.setMonth(today.getMonth() - 1)
      url = `https://api.upstox.com/v3/historical-candle/${encodeURIComponent(
        instrumentKey
      )}/minutes/60/${today.toISOString().split("T")[0]}/${fromDate.toISOString().split("T")[0]}`
    } else {
      fromDate.setFullYear(today.getFullYear() - 1)
      url = `https://api.upstox.com/v2/historical-candle/${encodeURIComponent(
        instrumentKey
      )}/day/${today.toISOString().split("T")[0]}/${fromDate.toISOString().split("T")[0]}`
    }

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })

    let candles = response.data?.data?.candles || []

    if (range === "1D" && candles.length > 0) {
      const targetDate = dateParam || today.toISOString().split("T")[0]
      candles = candles.filter(
        (c: any) => new Date(c[0]).toISOString().split("T")[0] === targetDate
      )
    }

    const chartData = candles.map((c: any) => ({
      time: Math.floor(new Date(c[0]).getTime() / 1000),
      open: Number(c[1]),
      high: Number(c[2]),
      low: Number(c[3]),
      close: Number(c[4]),
      volume: Number(c[5]),
    }))

    const result = chartData.reverse()

    if (result.length > 0) {
      await redis.set(cacheKey, JSON.stringify(result), { EX: 30 })
    }

    return NextResponse.json(result)

  } catch (error: any) {
    console.error("Stocks API Error:", error.response?.data || error.message)
    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 500 }
    )
  }
}
