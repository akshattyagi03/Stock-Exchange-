"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

interface Category {
  name: string
  funds: number
  percentage: number
  color: string
}

const categories: Category[] = [
  { name: "Equity", funds: 1, percentage: 69.44, color: "#6c63ff" },
  { name: "Debt", funds: 0, percentage: 0, color: "#4b5563" },
  { name: "Hybrid", funds: 0, percentage: 0, color: "#374151" },
  { name: "Others", funds: 2, percentage: 30.56, color: "#10b981" },
]

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

interface Props {
  onCategoryClick?: (category: string) => void
}

export default function CategoryDistribution({ onCategoryClick }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)
  const totalFunds = categories.reduce((sum, c) => sum + c.funds, 0)
  const chartData = categories.filter((c) => c.percentage > 0)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Category Distribution</h2>

      <div className="flex items-center gap-6">
        {/* List */}
        <div className="flex-1 space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onCategoryClick?.(cat.name)}
              onMouseEnter={() => setHovered(cat.name)}
              onMouseLeave={() => setHovered(null)}
              className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors text-left ${
                hovered === cat.name ? "bg-white/5" : ""
              }`}
            >
              <span
                className="size-3 rounded-sm shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="flex-1 text-sm font-medium">{cat.name}</span>
              <span className="text-xs text-white/40">{cat.funds} fund{cat.funds !== 1 ? "s" : ""}</span>
              <span className="text-sm font-semibold w-14 text-right">{cat.percentage}%</span>
              <ChevronRight className="size-3.5 text-white/30" />
            </button>
          ))}
        </div>

        {/* Donut */}
        <div className="relative size-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={64}
                paddingAngle={2}
                dataKey="percentage"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    opacity={hovered && hovered !== entry.name ? 0.3 : 1}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-base font-bold">{totalFunds}</p>
            <p className="text-xs text-white/40">funds</p>
          </div>
        </div>
      </div>
    </div>
  )
}