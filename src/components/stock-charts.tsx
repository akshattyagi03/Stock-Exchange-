"use client"

import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  type CandlestickData,
  type HistogramData,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from "lightweight-charts"
import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"

interface Props {
  symbol: string
}

type ChartCandle = {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

const FALLBACK_RANGES: Record<string, string[]> = {
  "1W": ["1M", "1Y"],
  "1M": ["1Y"],
  "1Y": [],
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function isChartCandle(value: unknown): value is ChartCandle {
  if (!value || typeof value !== "object") return false

  const candle = value as Partial<Record<keyof ChartCandle, unknown>>
  return (
    isNumber(candle.time) &&
    isNumber(candle.open) &&
    isNumber(candle.high) &&
    isNumber(candle.low) &&
    isNumber(candle.close) &&
    isNumber(candle.volume)
  )
}

function isCandlePoint(
  value: unknown
): value is Omit<ChartCandle, "time" | "volume"> {
  if (!value || typeof value !== "object") return false

  const candle = value as Partial<
    Record<"open" | "high" | "low" | "close", unknown>
  >
  return (
    isNumber(candle.open) &&
    isNumber(candle.high) &&
    isNumber(candle.low) &&
    isNumber(candle.close)
  )
}

async function fetchChartData(symbol: string, range: string) {
  const res = await fetch(
    `/api/stocks/${encodeURIComponent(symbol)}?range=${encodeURIComponent(range)}`
  )

  const contentType = res.headers.get("content-type") || ""

  if (!res.ok || !contentType.includes("application/json")) {
    const body = await res.text()
    throw new Error(
      `Chart API failed (${res.status}): ${body.slice(0, 120)}`
    )
  }

  const data: unknown = await res.json()
  return Array.isArray(data) ? data.filter(isChartCandle) : []
}

export default function StockChart({ symbol }: Props) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null)

  const [range, setRange] = useState("1D")
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    const container = chartContainerRef.current
    if (!container) return

    const isDark = (theme === "system" ? resolvedTheme : theme) === "dark"

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 380,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: isDark ? "#cbd5f5" : "#334155",
      },
      grid: {
        vertLines: { color: "rgba(100, 116, 139, 0.2)" },
        horzLines: { color: "rgba(100, 116, 139, 0.2)" },
      },
      localization: {
        locale: "en-IN",
        timeFormatter: (time: number) =>
          new Date(time * 1000).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
      },
      timeScale: {
        borderColor: "rgba(100, 116, 139, 0.2)",
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (time: number) =>
          new Date(time * 1000).toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
          }),
      },
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    })

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      lastValueVisible: false,
      priceLineVisible: false,
    })

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    })

    chartRef.current = chart
    seriesRef.current = candleSeries
    volumeSeriesRef.current = volumeSeries

    const toolTip = document.createElement("div")
    toolTip.className =
      "absolute hidden px-3 py-2 bg-popover border border-border rounded-md text-xs text-popover-foreground pointer-events-none z-[100] whitespace-nowrap shadow-md"
    container.style.position = "relative"
    container.appendChild(toolTip)

    chart.subscribeCrosshairMove((param) => {
      if (!param.point || !param.time || param.point.x < 0 || param.point.y < 0) {
        toolTip.style.display = "none"
        return
      }

      const date = new Date((param.time as number) * 1000)
      const formatted = date.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })

      const data = param.seriesData.get(candleSeries)
      if (!isCandlePoint(data)) {
        toolTip.style.display = "none"
        return
      }

      toolTip.style.display = "block"
      toolTip.innerHTML = `
        <div class="text-muted-foreground mb-1">${formatted}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 12px">
          <span class="text-muted-foreground">O</span><span class="font-medium">Rs.${data.open.toFixed(2)}</span>
          <span class="text-muted-foreground">H</span><span class="font-medium text-emerald-500">Rs.${data.high.toFixed(2)}</span>
          <span class="text-muted-foreground">L</span><span class="font-medium text-red-500">Rs.${data.low.toFixed(2)}</span>
          <span class="text-muted-foreground">C</span><span class="font-medium">Rs.${data.close.toFixed(2)}</span>
        </div>
      `

      const containerWidth = container.clientWidth
      const tooltipWidth = 160
      const left = param.point.x + 16
      toolTip.style.left =
        (left + tooltipWidth > containerWidth ? left - tooltipWidth - 32 : left) +
        "px"
      toolTip.style.top = Math.max(0, param.point.y - 60) + "px"
    })

    const handleResize = () => {
      chart.applyOptions({ width: container.clientWidth })
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      chart.remove()
      toolTip.remove()
    }
  }, [theme, resolvedTheme])

  useEffect(() => {
    if (chartRef.current) {
      const isDark = (theme === "system" ? resolvedTheme : theme) === "dark"
      chartRef.current.applyOptions({
        layout: {
          textColor: isDark ? "#cbd5f5" : "#334155",
        },
      })
    }
  }, [theme, resolvedTheme])

  useEffect(() => {
    async function loadChartData(currentRange: string) {
      seriesRef.current?.setData([])
      volumeSeriesRef.current?.setData([])

      try {
        const data = await fetchChartData(symbol, currentRange)

        if (data.length === 0) {
          const fallbacks = FALLBACK_RANGES[currentRange]
          if (fallbacks?.length) {
            loadChartData(fallbacks[0])
          }
          return
        }

        const candleData: CandlestickData<Time>[] = data.map((d) => ({
          time: d.time as Time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))

        const volumeData: HistogramData<Time>[] = data.map((d) => ({
          time: d.time as Time,
          value: d.volume,
          color: d.close >= d.open ? "#22c55e50" : "#ef444450",
        }))

        seriesRef.current?.setData(candleData)
        volumeSeriesRef.current?.setData(volumeData)
        chartRef.current?.timeScale().fitContent()
      } catch (err) {
        console.error("Chart fetch error:", err)
      }
    }

    loadChartData(range)
  }, [symbol, range])

  return (
    <div className="w-full">
      <div className="mb-4 flex gap-2">
        {["1D", "1W", "1M", "1Y"].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`rounded px-3 py-1 text-sm transition-colors ${
              range === r
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div ref={chartContainerRef} className="w-full overflow-hidden rounded-lg" />
    </div>
  )
}
