"use client"

import { useState, useEffect } from "react"
import { Bot, TrendingUp, GitCompare, Sparkles, PieChart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LevelSelector, type Level } from "@/components/ai-advisor/level-selector"
import { AnalyzeTab } from "@/components/ai-advisor/analyze-tab"
import { CompareTab } from "@/components/ai-advisor/compare-tab"
import { PortfolioAnalyticsTab } from "@/components/ai-advisor/portfolio-ai-analysis"
import { PremiumLockCard } from "@/components/ai-advisor/premium-lock-card"

export default function AdvisorPage() {
  const [level, setLevel] = useState<Level>("intermediate")
  const [tier, setTier] = useState<"standard" | "premium">("standard")

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => { if (!data.error) setTier(data.tier ?? "standard") })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot className="size-4 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">AI Advisor</h1>
          </div>
          <p className="text-muted-foreground text-sm pl-10">
            Analyse stocks and compare performance with AI
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge variant="outline" className="gap-1.5 text-xs">
            <Sparkles className="size-3" />
            Powered by Gemini
          </Badge>
          <LevelSelector value={level} onChange={setLevel} />
        </div>
      </div>

      <Tabs defaultValue="analyze">
        <TabsList className="h-9">
          <TabsTrigger value="analyze" className="gap-1.5 text-xs">
            <TrendingUp className="size-3.5" />
            Analyse
          </TabsTrigger>
          <TabsTrigger value="compare" className="gap-1.5 text-xs">
            <GitCompare className="size-3.5" />
            Compare
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="gap-1.5 text-xs">
            <PieChart className="size-3.5" />
            Portfolio
            {tier !== "premium" && (
              <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: "linear-gradient(135deg, #a855f7, #6366f1)", color: "#fff", fontWeight: 600, marginLeft: 2 }}>
                PRO
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="analyze">
            <AnalyzeTab level={level} />
          </TabsContent>
          <TabsContent value="compare">
            <CompareTab level={level} />
          </TabsContent>
          <TabsContent value="portfolio">
            {tier === "premium" ? (
              <PortfolioAnalyticsTab />
            ) : (
              <PremiumLockCard
                title="Unlock Portfolio Analytics"
                description="Get AI-powered insights on your portfolio performance, risk, and diversification. Available exclusively for Premium users."
                ctaLabel="Upgrade to Premium"
                onUpgrade={() => {}}
              />
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
