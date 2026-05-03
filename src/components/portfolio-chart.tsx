"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts"

export type PortfolioChartPoint = {
  date: string
  value: number
  invested: number
}

type TooltipPayload = {
  value?: number
}

type TooltipProps = {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}

const formatCurrency = (value: number, maximumFractionDigits = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits,
  }).format(value)

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 text-muted-foreground">{label}</p>
      <p className="font-semibold text-[#6c63ff]">
        {formatCurrency(payload[0]?.value ?? 0)}
      </p>
    </div>
  )
}

interface Props {
  currentValue: number
  investedValue: number
  data: PortfolioChartPoint[]
}

export default function PortfolioChart({
  currentValue,
  investedValue,
  data,
}: Props) {
  const pnl = currentValue - investedValue
  const pnlPct = investedValue > 0 ? ((pnl / investedValue) * 100).toFixed(2) : "0.00"
  const isProfit = pnl >= 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block h-px w-6 bg-[#6c63ff]" /> Current
          </p>
          <p className="text-3xl font-bold tracking-tight">
            {formatCurrency(currentValue)}
          </p>
          <p
            className={`mt-1 text-sm font-medium ${
              isProfit ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isProfit ? "+" : ""}
            {formatCurrency(Math.abs(pnl))} ({isProfit ? "+" : ""}
            {pnlPct}%)
          </p>
        </div>
        <div className="text-right">
          <p className="mb-1 flex items-center justify-end gap-2 text-xs text-muted-foreground">
            Invested{" "}
            <span className="inline-block w-6 border-t border-dashed border-border" />
          </p>
          <p className="text-3xl font-bold tracking-tight text-foreground/70">
            {formatCurrency(investedValue)}
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--border))" }} />
            <ReferenceLine
              y={investedValue}
              stroke="hsl(var(--border))"
              strokeDasharray="4 4"
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#6c63ff"
              strokeWidth={2}
              dot={data.length <= 2}
              activeDot={{ r: 4, fill: "#6c63ff", stroke: "hsl(var(--background))", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
