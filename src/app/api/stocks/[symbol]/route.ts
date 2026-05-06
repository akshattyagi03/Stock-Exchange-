import axios from "axios"
import { NextResponse } from "next/server"

import { getInstrumentKeyBySymbol } from "@/lib/instruments"
import { redis, connectRedis } from "@/lib/redis"

type UpstoxCandle = [string, number, number, number, number, number]

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000
const MAX_DAY_FALLBACK_ATTEMPTS = 10

function getIstDateString(date = new Date()) {
  return new Date(date.getTime() + IST_OFFSET_MS).toISOString().split("T")[0]
}

function subtractDays(dateString: string, days: number) {
  const [year, month, day] = dateString.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString().split("T")[0]
}

function isMarketOpen(date = new Date()) {
  const istNow = new Date(date.getTime() + IST_OFFSET_MS)
  const day = istNow.getUTCDay()
  if (day === 0 || day === 6) return false

  const totalMinutes = istNow.getUTCHours() * 60 + istNow.getUTCMinutes()
  return totalMinutes >= 9 * 60 + 15 && totalMinutes <= 15 * 60 + 30
}

function candleMatchesIstDate(candle: UpstoxCandle, dateString: string) {
  return getIstDateString(new Date(candle[0])) === dateString
}

function toChartData(candles: UpstoxCandle[]) {
  return candles
    .map((c) => ({
      time: Math.floor(new Date(c[0]).getTime() / 1000),
      open: Number(c[1]),
      high: Number(c[2]),
      low: Number(c[3]),
      close: Number(c[4]),
      volume: Number(c[5]),
    }))
    .reverse()
}

async function fetchCandles(url: string, accessToken: string) {
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  })

  return (response.data?.data?.candles || []) as UpstoxCandle[]
}

function intradayUrl(instrumentKey: string) {
  return `https://api.upstox.com/v2/historical-candle/intraday/${encodeURIComponent(
    instrumentKey
  )}/1minute`
}

function historicalMinuteUrl(
  instrumentKey: string,
  targetDate: string,
  interval = 1,
  lookbackDays = 1
) {
  return `https://api.upstox.com/v3/historical-candle/${encodeURIComponent(
    instrumentKey
  )}/minutes/${interval}/${targetDate}/${subtractDays(targetDate, lookbackDays)}`
}

async function fetchOneDayCandles({
  instrumentKey,
  accessToken,
  targetDate,
  todayStr,
  marketOpen,
}: {
  instrumentKey: string
  accessToken: string
  targetDate: string
  todayStr: string
  marketOpen: boolean
}) {
  const isLiveToday = targetDate === todayStr && marketOpen

  if (isLiveToday) {
    const intradayCandles = await fetchCandles(
      intradayUrl(instrumentKey),
      accessToken
    )
    const todaysCandles = intradayCandles.filter((candle) =>
      candleMatchesIstDate(candle, targetDate)
    )

    if (todaysCandles.length > 0) return todaysCandles

    const historicalCandles = await fetchCandles(
      historicalMinuteUrl(instrumentKey, targetDate),
      accessToken
    )

    return historicalCandles.filter((candle) =>
      candleMatchesIstDate(candle, targetDate)
    )
  }

  for (let i = 0; i < MAX_DAY_FALLBACK_ATTEMPTS; i++) {
    const candidateDate = subtractDays(targetDate, i)
    const candles = await fetchCandles(
      historicalMinuteUrl(instrumentKey, candidateDate),
      accessToken
    )
    const matchingCandles = candles.filter((candle) =>
      candleMatchesIstDate(candle, candidateDate)
    )

    if (matchingCandles.length > 0) return matchingCandles
  }

  return []
}

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
    const today = new Date()
    const todayStr = getIstDateString(today)
    const marketOpen = isMarketOpen(today)
    const cacheDateKey = range === "1D" ? dateParam || todayStr : "latest"
    const cacheKey = `stock:${upperSymbol}:${range}:${cacheDateKey}`

    const cached = await redis.get(cacheKey)
    if (cached) return NextResponse.json(JSON.parse(cached))

    const accessToken = process.env.UPSTOX_ACCESS_TOKEN
    const instrumentKey = getInstrumentKeyBySymbol(upperSymbol)

    if (!accessToken) {
      return NextResponse.json(
        { error: "Upstox access token not configured" },
        { status: 500 }
      )
    }

    if (!instrumentKey) {
      return NextResponse.json({ error: "Invalid symbol" }, { status: 400 })
    }

    let candles: UpstoxCandle[] = []

    if (range === "1D") {
      candles = await fetchOneDayCandles({
        instrumentKey,
        accessToken,
        targetDate: dateParam || todayStr,
        todayStr,
        marketOpen,
      })
    } else if (range === "1W") {
      candles = await fetchCandles(
        `https://api.upstox.com/v3/historical-candle/${encodeURIComponent(
          instrumentKey
        )}/minutes/15/${todayStr}/${subtractDays(todayStr, 7)}`,
        accessToken
      )
    } else if (range === "1M") {
      candles = await fetchCandles(
        `https://api.upstox.com/v3/historical-candle/${encodeURIComponent(
          instrumentKey
        )}/minutes/60/${todayStr}/${subtractDays(todayStr, 30)}`,
        accessToken
      )
    } else if (range === "1Y") {
      candles = await fetchCandles(
        `https://api.upstox.com/v2/historical-candle/${encodeURIComponent(
          instrumentKey
        )}/day/${todayStr}/${subtractDays(todayStr, 365)}`,
        accessToken
      )
    }

    const result = toChartData(candles)

    if (result.length > 0) {
      await redis.set(cacheKey, JSON.stringify(result), {
        EX: range === "1D" && marketOpen ? 30 : 300,
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Stocks API Error:", message)
    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 500 }
    )
  }
}
