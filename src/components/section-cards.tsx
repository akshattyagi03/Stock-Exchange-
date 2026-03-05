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

  const fetchSummary = async () => {
    if (document.visibilityState !== "visible") return

    try {
      const res = await fetch("/api/portfolio-summary")
      const data = await res.json()
      setSummary(data)
    } catch (error) {
      console.error("Failed to fetch summary:", error)
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout

    const startPolling = () => {
      fetchSummary()
      interval = setInterval(fetchSummary, 15000)
    }

    const stopPolling = () => {
      if (interval) clearInterval(interval)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startPolling()
      } else {
        stopPolling()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    startPolling()

    return () => {
      stopPolling()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  if (!summary) return null

  const overallPercentage =
    summary.totalInvested > 0
      ? (summary.overallPnL / summary.totalInvested) * 100
      : 0

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card>
        <CardHeader>
          <CardDescription>Total Portfolio Value</CardDescription>
          <CardTitle className="text-2xl font-semibold">
            ₹{summary.totalPortfolioValue.toFixed(2)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-muted-foreground text-sm">
          Current market value of all holdings
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Today's P&L</CardDescription>
          <CardTitle
            className={`text-2xl font-semibold ${summary.todaysPnL >= 0 ? "text-green-600" : "text-red-600"
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
          Updates every 15 seconds
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Overall P&L</CardDescription>
          <CardTitle
            className={`text-2xl font-semibold ${summary.overallPnL >= 0 ? "text-green-600" : "text-red-600"
              }`}
          >
            ₹{summary.overallPnL.toFixed(2)} (
            {overallPercentage.toFixed(2)}%)
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-sm">
          Since investment started
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Total Invested</CardDescription>
          <CardTitle className="text-2xl font-semibold">
            ₹{summary.totalInvested.toFixed(2)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-muted-foreground text-sm">
          Total capital deployed
        </CardFooter>
      </Card>
    </div>
  )
}