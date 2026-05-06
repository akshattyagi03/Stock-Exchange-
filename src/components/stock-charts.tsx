"use client"

import { createChart, ColorType, CandlestickSeries, HistogramSeries, IChartApi, ISeriesApi } from "lightweight-charts"
import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"

interface Props {
  symbol: string
}

const FALLBACK_RANGES: Record<string, string[]> = {
  "1W": ["1M", "1Y"],
  "1M": ["1Y"],
  "1Y": [],
}

async function fetchWithDayFallback(symbol: string): Promise<any[]> {
  // First try without date — API will use intraday if market is open
  const res = await fetch(`/api/stocks/${encodeURIComponent(symbol)}?range=1D`)
  if (res.ok) {
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) return data
  }

  // Fallback to previous trading days
  const today = new Date()
  for (let i = 1; i <= 10; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    const r = await fetch(`/api/stocks/${encodeURIComponent(symbol)}?range=1D&date=${dateStr}`)
    if (!r.ok) continue
    const data = await r.json()
    if (Array.isArray(data) && data.length > 0) return data
  }
  return []
}

export default function StockChart({ symbol }: Props) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null)

  const [range, setRange] = useState("1D")
  const { theme, resolvedTheme } = useTheme()

  /* ---------------- Create Chart Once ---------------- */

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

    /* ---------------- Crosshair Tooltip ---------------- */

    const toolTip = document.createElement("div")
    toolTip.className = "absolute hidden px-3 py-2 bg-popover border border-border rounded-md text-xs text-popover-foreground pointer-events-none z-[100] whitespace-nowrap shadow-md"
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

      const data = param.seriesData.get(candleSeries) as any
      if (!data) {
        toolTip.style.display = "none"
        return
      }

      toolTip.style.display = "block"
      toolTip.innerHTML = `
        <div class="text-muted-foreground mb-1">${formatted}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 12px">
          <span class="text-muted-foreground">O</span><span class="font-medium">₹${data.open.toFixed(2)}</span>
          <span class="text-muted-foreground">H</span><span class="font-medium text-emerald-500">₹${data.high.toFixed(2)}</span>
          <span class="text-muted-foreground">L</span><span class="font-medium text-red-500">₹${data.low.toFixed(2)}</span>
          <span class="text-muted-foreground">C</span><span class="font-medium">₹${data.close.toFixed(2)}</span>
        </div>
      `

      const containerWidth = container.clientWidth
      const tooltipWidth = 160
      const left = param.point.x + 16
      toolTip.style.left = (left + tooltipWidth > containerWidth ? left - tooltipWidth - 32 : left) + "px"
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
  }, [])

  /* ---------------- Handle Theme Change ---------------- */

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

  /* ---------------- Fetch Data with Fallback ---------------- */

  useEffect(() => {
    async function loadChartData(currentRange: string) {
      seriesRef.current?.setData([])
      volumeSeriesRef.current?.setData([])

      try {
        let data: any[]

        if (currentRange === "1D") {
          data = await fetchWithDayFallback(symbol)
        } else {
          const res = await fetch(`/api/stocks/${encodeURIComponent(symbol)}?range=${encodeURIComponent(currentRange)}`)
          data = await res.json()
        }

        if (!Array.isArray(data) || data.length === 0) {
          const fallbacks = FALLBACK_RANGES[currentRange]
          if (fallbacks && fallbacks.length > 0) {
            console.log(`No data for ${currentRange}, falling back to ${fallbacks[0]}`)
            loadChartData(fallbacks[0])
          } else {
            console.log("No chart data found for any range")
          }
          return
        }

        const candleData = data.map((d: any) => ({
          time: d.time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))

        const volumeData = data.map((d: any) => ({
          time: d.time,
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

  /* ---------------- UI ---------------- */

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-4">
        {["1D", "1W", "1M", "1Y"].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1 rounded text-sm transition-colors ${range === r
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div
        ref={chartContainerRef}
        className="w-full rounded-lg overflow-hidden"
      />
    </div>
  )
}
