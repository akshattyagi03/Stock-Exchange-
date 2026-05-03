"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

export type AllocTab = "Sectors" | "Market Cap" | "Companies"

export type AllocationItem = {
  name: string
  percentage: number
  color: string
}

export type AllocationData = Record<AllocTab, AllocationItem[]>

type TooltipPayload = {
  payload: AllocationItem
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

export default function EquityAllocation({ data }: { data: AllocationData }) {
  const [tab, setTab] = useState<AllocTab>("Companies")
  const [hovered, setHovered] = useState<string | null>(null)
  const activeData = data[tab]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Equity asset allocation</h2>

      <div className="flex gap-2">
        {(["Sectors", "Market Cap", "Companies"] as AllocTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
              tab === t
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex-1 space-y-1">
          {activeData.map((item) => (
            <div
              key={item.name}
              onMouseEnter={() => setHovered(item.name)}
              onMouseLeave={() => setHovered(null)}
              className={`flex cursor-default items-center gap-3 rounded-lg px-2 py-2 transition-colors ${
                hovered === item.name ? "bg-muted/50" : ""
              }`}
            >
              <span
                className="size-3 shrink-0 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="flex-1 text-sm text-foreground/80">{item.name}</span>
              <span className="text-sm font-semibold">{item.percentage}%</span>
            </div>
          ))}
        </div>

        <div className="relative size-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={activeData.filter((item) => item.percentage > 0)}
                cx="50%"
                cy="50%"
                innerRadius={44}
                outerRadius={68}
                paddingAngle={2}
                dataKey="percentage"
              >
                {activeData.map((entry) => (
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
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs font-semibold text-muted-foreground">{tab}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
