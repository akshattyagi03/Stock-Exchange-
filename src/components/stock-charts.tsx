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

  const IST_OFFSET = 5.5 * 60 * 60

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
      },
      timeScale: {
        borderColor: "#1e293b",
        timeVisible: true,
        secondsVisible: false,
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
      lastValueVisible: false,    // ← hides the fixed 797K label
      priceLineVisible: false,    // ← hides the horizontal price line
    })

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8, // volume takes bottom 20% of chart
        bottom: 0,
      },
    })

    chartRef.current = chart
    seriesRef.current = candleSeries
    volumeSeriesRef.current = volumeSeries

    const handleResize = () => {
      chart.applyOptions({ width: container.clientWidth })
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      chart.remove()
    }
  }, [])

  /* ---------------- Fetch Data ---------------- */

  useEffect(() => {
    async function loadChartData() {
      const res = await fetch(`/api/stocks/${symbol}?range=${range}`)
      const data = await res.json()

      if (!Array.isArray(data) || data.length === 0) {
        console.log("No chart data returned")
        return
      }
      console.log("Sample volume:", data[0]?.volume)
      const candleData = data.map((d: any) => ({
        time: d.time + IST_OFFSET,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))

      const volumeData = data.map((d: any) => ({
        time: d.time + IST_OFFSET,
        value: d.volume,
        color: d.close >= d.open ? "#22c55e50" : "#ef444450", // green/red with opacity
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