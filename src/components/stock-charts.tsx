"use client"

import { createChart, ColorType, CandlestickSeries, HistogramSeries, IChartApi, ISeriesApi } from "lightweight-charts"
import { useEffect, useRef, useState } from "react"

interface Props {
  symbol: string
}

export default function StockChart({ symbol }: Props) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null)

  const [range, setRange] = useState("1D")

  /* ---------------- Create Chart Once ---------------- */

  useEffect(() => {
    const container = chartContainerRef.current
    if (!container) return

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 500,
      layout: {
        background: { type: ColorType.Solid, color: "#020617" },
        textColor: "#cbd5f5",
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
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
        borderColor: "#1e293b",
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
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    })

    chartRef.current = chart
    seriesRef.current = candleSeries
    volumeSeriesRef.current = volumeSeries

    /* ---------------- Crosshair Tooltip ---------------- */

    const toolTip = document.createElement("div")
    toolTip.style.cssText = `
      position: absolute;
      display: none;
      padding: 6px 10px;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 6px;
      font-size: 12px;
      color: #cbd5f5;
      pointer-events: none;
      z-index: 100;
      white-space: nowrap;
    `
    container.style.position = "relative"
    container.appendChild(toolTip)

    chart.subscribeCrosshairMove((param) => {
      if (
        !param.point ||
        !param.time ||
        param.point.x < 0 ||
        param.point.y < 0
      ) {
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
        <div style="color:#94a3b8;margin-bottom:4px">${formatted}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 12px">
          <span style="color:#94a3b8">O</span><span>₹${data.open.toFixed(2)}</span>
          <span style="color:#94a3b8">H</span><span style="color:#22c55e">₹${data.high.toFixed(2)}</span>
          <span style="color:#94a3b8">L</span><span style="color:#ef4444">₹${data.low.toFixed(2)}</span>
          <span style="color:#94a3b8">C</span><span>₹${data.close.toFixed(2)}</span>
        </div>
      `

      const containerWidth = container.clientWidth
      const tooltipWidth = 160
      const left = param.point.x + 16
      toolTip.style.left = (left + tooltipWidth > containerWidth ? left - tooltipWidth - 32 : left) + "px"
      toolTip.style.top = Math.max(0, param.point.y - 60) + "px"
    })

    /* ---------------- Resize ---------------- */

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

  /* ---------------- Fetch Data ---------------- */

  useEffect(() => {
    async function loadChartData() {
      seriesRef.current?.setData([])
      volumeSeriesRef.current?.setData([])

      const res = await fetch(`/api/stocks/${symbol}?range=${range}`)
      const data = await res.json()

      if (!Array.isArray(data) || data.length === 0) {
        console.log("No chart data returned")
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
    }

    loadChartData()
  }, [symbol, range])

  /* ---------------- UI ---------------- */

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-4">
        {["1D", "1W", "1M", "1Y"].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1 rounded text-sm ${range === r
              ? "bg-blue-500 text-white"
              : "bg-gray-800 text-gray-300"
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