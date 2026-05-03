"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import PortfolioChart, { type PortfolioChartPoint } from "@/components/portfolio-chart"
import CategoryDistribution, { type Category } from "@/components/category-distribution"
import EquityAllocation, { type AllocationData } from "@/components/equity-allocation"
import TaxCapitalGains from "@/components/tax-capital-gains"
import HoldingsList, { type AnalyticsHolding } from "@/components/holdings-list"

type PortfolioSummary = {
  totalPortfolioValue: number
  totalInvested: number
  overallPnL: number
  todaysPnL: number
}

type AnalyticsPayload = {
  summary: PortfolioSummary
  holdings: AnalyticsHolding[]
  chartData: PortfolioChartPoint[]
  categoryDistribution: Category[]
  equityAllocation: AllocationData
}

const emptyAnalytics: AnalyticsPayload = {
  summary: {
    totalPortfolioValue: 0,
    totalInvested: 0,
    overallPnL: 0,
    todaysPnL: 0,
  },
  holdings: [],
  chartData: [],
  categoryDistribution: [],
  equityAllocation: {
    Sectors: [],
    "Market Cap": [],
    Companies: [],
  },
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsPayload>(emptyAnalytics)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/portfolio-analytics")

        if (!response.ok) {
          throw new Error("Failed to load portfolio analytics")
        }

        const data = await response.json()
        setAnalytics({
          summary: data.summary ?? emptyAnalytics.summary,
          holdings: data.holdings ?? [],
          chartData: data.chartData ?? [],
          categoryDistribution: data.categoryDistribution ?? [],
          equityAllocation: data.equityAllocation ?? emptyAnalytics.equityAllocation,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load analytics")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen text-foreground">
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-80 animate-pulse rounded-2xl bg-muted/50" />
          <div className="h-40 animate-pulse rounded-2xl bg-muted/50" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen text-foreground">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-foreground">
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[220px_1fr]">
          <div className="space-y-3 pt-2">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
              Portfolio
              <br />
              analysis
            </h1>
            <div className="h-1 w-10 rounded-full bg-emerald-400" />
          </div>

          <PortfolioChart
            currentValue={analytics.summary.totalPortfolioValue}
            investedValue={analytics.summary.totalInvested}
            data={analytics.chartData}
          />
        </div>

        <Separator className="bg-border" />

        <Tabs defaultValue="overview">
          <TabsList className="mb-8 h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0">
            {["overview", "tax"].map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className="mr-6 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3 pt-0 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground/80 data-[state=active]:border-emerald-400 data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                {t === "overview" ? "Overview" : "Tax & Capital Gains"}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-0 space-y-10">
            <CategoryDistribution categories={analytics.categoryDistribution} />

            <Separator className="bg-border" />

            <EquityAllocation data={analytics.equityAllocation} />

            <Separator className="bg-border" />

            <HoldingsList holdings={analytics.holdings} />
          </TabsContent>

          <TabsContent value="tax" className="mt-0">
            <TaxCapitalGains
              summary={analytics.summary}
              holdingsCount={analytics.holdings.length}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
