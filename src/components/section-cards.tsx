"use client"

import { useEffect, useState } from "react"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Summary {
  totalPortfolioValue: number
  totalInvested: number
  overallPnL: number
  todaysPnL: number
}

export function SectionCards() {
  const [summary, setSummary] = useState<Summary | null>(null)

  useEffect(() => {
    const fetchSummary = async () => {
      const res = await fetch("/api/portfolio-summary")
      const data = await res.json()
      setSummary(data)
    }

    fetchSummary()
  }, [])

  if (!summary) return null

  const overallPercentage =
    summary.totalInvested > 0
      ? (summary.overallPnL / summary.totalInvested) * 100
      : 0

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      
      {/* Total Portfolio Value */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Portfolio Value</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ₹{summary.totalPortfolioValue.toFixed(2)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-muted-foreground text-sm">
          Current market value of all holdings
        </CardFooter>
      </Card>

      {/* Today's P&L */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Today's P&L</CardDescription>
          <CardTitle
            className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${
              summary.todaysPnL >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            ₹{summary.todaysPnL.toFixed(2)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {summary.todaysPnL >= 0 ? (
                <IconTrendingUp className="size-4" />
              ) : (
                <IconTrendingDown className="size-4" />
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="text-sm">
          Day change based on current market movement
        </CardFooter>
      </Card>

      {/* Overall P&L */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Overall P&L</CardDescription>
          <CardTitle
            className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${
              summary.overallPnL >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            ₹{summary.overallPnL.toFixed(2)} (
            {overallPercentage.toFixed(2)}%)
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {summary.overallPnL >= 0 ? (
                <IconTrendingUp className="size-4" />
              ) : (
                <IconTrendingDown className="size-4" />
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="text-sm">
          Profit or loss since investment started
        </CardFooter>
      </Card>

      {/* Total Invested */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Invested</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ₹{summary.totalInvested.toFixed(2)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-muted-foreground text-sm">
          Total capital invested in portfolio
        </CardFooter>
      </Card>
    </div>
  )
}