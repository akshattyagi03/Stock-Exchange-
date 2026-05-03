"use client"

import * as React from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Holding = {
  symbol: string
  quantity: number
  currentValue: number
  invested: number
  overallPnL: number
}

const COLORS = ["#2563eb", "#16a34a", "#f97316", "#9333ea", "#dc2626", "#0891b2"]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value)

export function ChartAreaInteractive() {
  const [data, setData] = React.useState<Holding[]>([])

  React.useEffect(() => {
    async function fetchAllocation() {
      const res = await fetch("/api/portfolio-summary")
      const result = await res.json()

      setData(result.allocation || [])
    }

    fetchAllocation()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Allocation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-72">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="currentValue"
                  nameKey="symbol"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                >
                  {data.map((item, index) => (
                    <Cell
                      key={item.symbol}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No holdings available for allocation.
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((holding, index) => {
            const isProfit = holding.overallPnL >= 0

            return (
              <div key={holding.symbol} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-semibold">{holding.symbol}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {holding.quantity} shares
                  </span>
                </div>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(holding.currentValue)}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      isProfit ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isProfit ? "+" : ""}
                    {formatCurrency(holding.overallPnL)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
