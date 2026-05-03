"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

export interface Category {
  name: string
  funds: number
  percentage: number
  color: string
}

type TooltipPayload = {
  payload: Category
}

type TooltipProps = {
  active?: boolean
  payload?: TooltipPayload[]
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload

  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-foreground">{d.name}</p>
      <p className="text-muted-foreground">{d.percentage}%</p>
    </div>
  )
}

interface Props {
  categories: Category[]
  onCategoryClick?: (category: string) => void
}

export default function CategoryDistribution({
  categories,
  onCategoryClick,
}: Props) {
  const [hovered, setHovered] = useState<string | null>(null)
  const totalFunds = categories.reduce((sum, c) => sum + c.funds, 0)
  const chartData = categories.filter((c) => c.percentage > 0)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Category Distribution</h2>

      <div className="flex items-center gap-6">
        <div className="flex-1 space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onCategoryClick?.(cat.name)}
              onMouseEnter={() => setHovered(cat.name)}
              onMouseLeave={() => setHovered(null)}
              className={`flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors ${
                hovered === cat.name ? "bg-muted/50" : ""
              }`}
            >
              <span
                className="size-3 shrink-0 rounded-sm"
                style={{ backgroundColor: cat.color }}
              />
              <span className="flex-1 text-sm font-medium">{cat.name}</span>
              <span className="text-xs text-muted-foreground">
                {cat.funds} holding{cat.funds !== 1 ? "s" : ""}
              </span>
              <span className="w-14 text-right text-sm font-semibold">
                {cat.percentage}%
              </span>
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </button>
          ))}
        </div>

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
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-base font-bold">{totalFunds}</p>
            <p className="text-xs text-muted-foreground">holdings</p>
          </div>
        </div>
      </div>
    </div>
  )
}
