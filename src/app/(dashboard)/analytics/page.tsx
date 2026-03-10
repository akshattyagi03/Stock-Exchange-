"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import PortfolioChart from "@/components/portfolio-chart"
import CategoryDistribution from "@/components/category-distribution"
import EquityAllocation from "@/components/equity-allocation"
import TaxCapitalGains from "@/components/tax-capital-gains"
import HoldingsList from "@/components/holdings-list"

// Replace with real data from your API/store
const PORTFOLIO = {
  currentValue: 33726,
  investedValue: 35998,
}

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* ── Header ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 items-start">

          {/* Left: Title */}
          <div className="space-y-3 pt-2">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
              Portfolio<br />analysis
            </h1>
            <div className="w-10 h-1 rounded-full bg-emerald-400" />
          </div>

          {/* Right: Chart */}
          <PortfolioChart
            currentValue={PORTFOLIO.currentValue}
            investedValue={PORTFOLIO.investedValue}
          />
        </div>

        <Separator className="bg-white/[0.07]" />

        {/* ── Overview / Tax tabs ─────────────────── */}
        <Tabs defaultValue="overview">
          <TabsList className="bg-transparent border-b border-white/[0.07] rounded-none w-full justify-start gap-0 h-auto p-0 mb-8">
            {["overview", "tax"].map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className={`
                  rounded-none border-b-2 pb-3 pt-0 px-0 mr-6 text-sm font-medium
                  data-[state=active]:border-emerald-400 data-[state=active]:text-white data-[state=active]:shadow-none
                  data-[state=inactive]:border-transparent data-[state=inactive]:text-white/40
                  bg-transparent hover:text-white/70 transition-colors
                `}
              >
                {t === "overview" ? "Overview" : "Tax & Capital Gains"}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview tab */}
          <TabsContent value="overview" className="space-y-10 mt-0">

            {/* Category Distribution */}
            <CategoryDistribution />

            <Separator className="bg-white/[0.07]" />

            {/* Equity Allocation */}
            <EquityAllocation />

            <Separator className="bg-white/[0.07]" />

            {/* Holdings */}
            <HoldingsList />

          </TabsContent>

          {/* Tax tab */}
          <TabsContent value="tax" className="mt-0">
            <TaxCapitalGains />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  )
}