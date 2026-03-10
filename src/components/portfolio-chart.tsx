"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts"

const RANGES = ["1M", "6M", "1Y", "All"] as const
type Range = (typeof RANGES)[number]

// Mock data — replace with real API fetch keyed by range
const mockData: Record<Range, { date: string; value: number; invested: number }[]> = {
  "1M": Array.from({ length: 30 }, (_, i) => ({
    date: `Mar ${i + 1}`,
    value: 35998 - Math.random() * 3000 + i * 30,
    invested: 35998,
  })),
  "6M": Array.from({ length: 24 }, (_, i) => ({
    date: `W${i + 1}`,
    value: 35998 - Math.random() * 4000 + i * 60,
    invested: 35998,
  })),
  "1Y": Array.from({ length: 12 }, (_, i) => ({
    date: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"][i],
    value: 28000 + i * 700 + Math.random() * 1500,
    invested: 35998,
  })),
  All: Array.from({ length: 20 }, (_, i) => ({
    date: `${2022 + Math.floor(i / 8)}Q${(i % 4) + 1}`,
    value: 20000 + i * 900 + Math.random() * 2000,
    invested: 35998,
  })),
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1f2e] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-white/50 mb-1">{label}</p>
      <p className="text-[#6c63ff] font-semibold">
        ₹{payload[0]?.value?.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
      </p>
    </div>
  )
}

interface Props {
  currentValue: number
  investedValue: number
}

export default function PortfolioChart({ currentValue, investedValue }: Props) {
  const [range, setRange] = useState<Range>("1M")
  const data = mockData[range]
  const pnl = currentValue - investedValue
  const pnlPct = ((pnl / investedValue) * 100).toFixed(2)
  const isProfit = pnl >= 0

  return (
    <div className="space-y-6">
      {/* Values row */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-white/40 flex items-center gap-2 mb-1">
            <span className="inline-block w-6 h-px bg-[#6c63ff]" /> Current
          </p>
          <p className="text-3xl font-bold tracking-tight">
            ₹{currentValue.toLocaleString("en-IN")}
          </p>
          <p className={`text-sm mt-1 font-medium ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
            {isProfit ? "+" : ""}₹{Math.abs(pnl).toLocaleString("en-IN")} ({isProfit ? "+" : ""}{pnlPct}%)
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/40 flex items-center justify-end gap-2 mb-1">
            Invested <span className="inline-block w-6 border-t border-dashed border-white/30" />
          </p>
          <p className="text-3xl font-bold tracking-tight text-white/60">
            ₹{investedValue.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="date"
              tick={{ fill: "#ffffff30", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#ffffff15" }} />
            <ReferenceLine
              y={investedValue}
              stroke="#ffffff25"
              strokeDasharray="4 4"
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#6c63ff"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#6c63ff", stroke: "#020617", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Range selector */}
      <div className="flex justify-center gap-3">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              range === r
                ? "border-white/30 text-white bg-white/10"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  )
}