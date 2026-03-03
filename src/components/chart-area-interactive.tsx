"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Holding = {
  _id: string
  symbol: string
  quantity: number
  avgPrice: number
}

export function ChartAreaInteractive() {
  const [data, setData] = React.useState<any[]>([])

  React.useEffect(() => {
    async function fetchHoldings() {
      const res = await fetch("/api/holdings")
      const result = await res.json()

      const holdings: Holding[] = result.data || []

      // Convert holdings into chart format
      const chartData = holdings.map((item) => ({
        symbol: item.symbol,
        value: item.quantity * item.avgPrice,
      }))

      setData(chartData)
    }

    fetchHoldings()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <AreaChart
          width={800}
          height={300}
          data={data}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="symbol" />
          <YAxis />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.3}
          />
        </AreaChart>
      </CardContent>
    </Card>
  )
}