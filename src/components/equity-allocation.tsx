"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

type AllocTab = "Sectors" | "Market Cap" | "Companies"

const sectorData = [
  { name: "Financial", percentage: 30.99, color: "#a3e635" },
  { name: "Technology", percentage: 28.92, color: "#10b981" },
  { name: "Industrials", percentage: 17.66, color: "#38bdf8" },
  { name: "Consumer Discretionary", percentage: 15.75, color: "#6c63ff" },
  { name: "Real Estate", percentage: 3.35, color: "#8b5cf6" },
  { name: "Others", percentage: 3.33, color: "#4b5563" },
]

const marketCapData = [
  { name: "Large Cap", percentage: 58.4, color: "#10b981" },
  { name: "Mid Cap", percentage: 27.3, color: "#6c63ff" },
  { name: "Small Cap", percentage: 14.3, color: "#a3e635" },
]

const companiesData = [
  { name: "HDFC Bank", percentage: 22.1, color: "#10b981" },
  { name: "Infosys", percentage: 18.4, color: "#6c63ff" },
  { name: "TCS", percentage: 16.8, color: "#38bdf8" },
  { name: "Reliance", percentage: 14.2, color: "#a3e635" },
  { name: "Wipro", percentage: 10.5, color: "#f59e0b" },
  { name: "Others", percentage: 18.0, color: "#4b5563" },
]

const tabData: Record<AllocTab, typeof sectorData> = {
  Sectors: sectorData,
  "Market Cap": marketCapData,
  Companies: companiesData,
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-[#1a1f2e] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-white font-semibold">{d.name}</p>
      <p className="text-white/60">{d.percentage}%</p>
    </div>
  )
}

export default function EquityAllocation() {
  const [tab, setTab] = useState<AllocTab>("Sectors")
  const [hovered, setHovered] = useState<string | null>(null)
  const data = tabData[tab]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Equity asset allocation</h2>

      {/* Tab pills */}
      <div className="flex gap-2">
        {(["Sectors", "Market Cap", "Companies"] as AllocTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              tab === t
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                : "border-white/15 text-white/50 hover:text-white/80 hover:border-white/30"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-6">
        {/* List */}
        <div className="flex-1 space-y-1">
          {data.map((item) => (
            <div
              key={item.name}
              onMouseEnter={() => setHovered(item.name)}
              onMouseLeave={() => setHovered(null)}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-colors cursor-default ${
                hovered === item.name ? "bg-white/5" : ""
              }`}
            >
              <span
                className="size-3 rounded-sm shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="flex-1 text-sm text-white/80">{item.name}</span>
              <span className="text-sm font-semibold">{item.percentage}%</span>
            </div>
          ))}
        </div>

        {/* Donut */}
        <div className="relative size-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={44}
                outerRadius={68}
                paddingAngle={2}
                dataKey="percentage"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    opacity={hovered && hovered !== entry.name ? 0.25 : 1}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-xs font-semibold text-white/50">{tab}</p>
          </div>
        </div>
      </div>
    </div>
  )
}