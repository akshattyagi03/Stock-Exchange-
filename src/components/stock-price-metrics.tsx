"use client"

import { useEffect, useState } from "react"

interface Props {
  symbol: string
}

interface StockData {
  price: number
  open: number
  high: number
  low: number
  volume: number
  change: number
  changePercent: number
}

const METRICS = [
  {
    key: "price",
    label: "Price",
    format: (v: number) => `₹${v.toLocaleString("en-IN")}`,
    color: { bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.25)", value: "#60a5fa", label: "#93bbfd" },
  },
  {
    key: "open",
    label: "Open",
    format: (v: number) => `₹${v.toLocaleString("en-IN")}`,
    color: { bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.25)", value: "#c084fc", label: "#d8b4fe" },
  },
  {
    key: "high",
    label: "High",
    format: (v: number) => `₹${v.toLocaleString("en-IN")}`,
    color: { bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.25)", value: "#4ade80", label: "#86efac" },
  },
  {
    key: "low",
    label: "Low",
    format: (v: number) => `₹${v.toLocaleString("en-IN")}`,
    color: { bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.25)", value: "#f87171", label: "#fca5a5" },
  },
  {
    key: "volume",
    label: "Volume",
    format: (v: number) => v.toLocaleString("en-IN"),
    color: { bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.25)", value: "#fbbf24", label: "#fde68a" },
  },
] as const

export default function StockPriceMetrics({ symbol }: Props) {
  const [data, setData] = useState<StockData | null>(null)

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/stocks/${symbol}/info`)
      const json = await res.json()
      setData(json)
    }
    fetchData()
  }, [symbol])

  if (!data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl px-4 py-3 animate-pulse"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", height: 80 }}
          />
        ))}
      </div>
    )
  }

  const isPositive = data.change >= 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {METRICS.map(({ key, label, format, color }) => (
        <div
          key={key}
          className="rounded-xl px-4 py-3 flex flex-col gap-1"
          style={{
            backgroundColor: color.bg,
            border: `1px solid ${color.border}`,
          }}
        >
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: color.label }}>
            {label}
          </span>
          <span className="text-base font-semibold font-mono tabular-nums" style={{ color: color.value }}>
            {format(data[key])}
          </span>
        </div>
      ))}

      {/* Change card — color depends on direction */}
      <div
        className="rounded-xl px-4 py-3 flex flex-col gap-1"
        style={{
          backgroundColor: isPositive ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
          border: `1px solid ${isPositive ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
        }}
      >
        <span
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: isPositive ? "#86efac" : "#fca5a5" }}
        >
          Change
        </span>
        <span
          className="text-base font-semibold font-mono tabular-nums"
          style={{ color: isPositive ? "#4ade80" : "#f87171" }}
        >
          {isPositive ? "+" : ""}{data.change} ({isPositive ? "+" : ""}{data.changePercent}%)
        </span>
      </div>
    </div>
  )
}