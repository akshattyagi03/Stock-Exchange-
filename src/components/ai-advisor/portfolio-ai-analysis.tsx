"use client"

import { useState } from "react"
import {
  Loader2,
  Sparkles,
  ShieldCheck,
  Activity,
  PieChart,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

/* ── Types ───────────────────────────────────────────────── */

interface Metric {
  label: string
  value: string
  sub: string
  icon: React.ReactNode
  color: string
  bg: string
}

interface SectorAllocation {
  sector: string
  percent: number
  color: string
}

interface Insight {
  type: "warning" | "tip" | "ok"
  text: string
}

/* ── Dummy data ──────────────────────────────────────────── */

const METRICS: Metric[] = [
  {
    label: "Portfolio Health",
    value: "7.5 / 10",
    sub: "Good overall balance",
    icon: <ShieldCheck style={{ width: 18, height: 18 }} />,
    color: "#4ade80",
    bg: "rgba(74,222,128,0.1)",
  },
  {
    label: "Risk Level",
    value: "Medium",
    sub: "Moderate volatility",
    icon: <Activity style={{ width: 18, height: 18 }} />,
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.1)",
  },
  {
    label: "Diversification",
    value: "6.2 / 10",
    sub: "Room to improve",
    icon: <PieChart style={{ width: 18, height: 18 }} />,
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.1)",
  },
]

const SECTORS: SectorAllocation[] = [
  { sector: "Information Technology", percent: 42, color: "#6366f1" },
  { sector: "Banking & Finance",       percent: 24, color: "#3b82f6" },
  { sector: "FMCG",                    percent: 14, color: "#10b981" },
  { sector: "Energy",                  percent: 12, color: "#f59e0b" },
  { sector: "Others",                  percent: 8,  color: "#94a3b8" },
]

const INSIGHTS: Insight[] = [
  { type: "warning", text: "Overexposed to IT sector — 42% allocation exceeds recommended 25%" },
  { type: "tip",     text: "Consider reallocating into FMCG for defensive exposure" },
  { type: "warning", text: "Moderate volatility detected — review positions in mid-cap segment" },
  { type: "tip",     text: "Banking allocation looks healthy; no action needed" },
  { type: "ok",      text: "Portfolio beta is 1.12 — slightly above market, acceptable range" },
]

const INSIGHT_STYLES = {
  warning: { icon: <AlertTriangle style={{ width: 13, height: 13, flexShrink: 0 }} />, color: "#fbbf24" },
  tip:     { icon: <TrendingUp    style={{ width: 13, height: 13, flexShrink: 0 }} />, color: "#60a5fa" },
  ok:      { icon: <CheckCircle2  style={{ width: 13, height: 13, flexShrink: 0 }} />, color: "#4ade80" },
}

/* ── Component ───────────────────────────────────────────── */

export function PortfolioAnalyticsTab() {
  const [analysed, setAnalysed] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleAnalyse() {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setAnalysed(true)
    }, 1800)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header card */}
      <Card style={{ border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden", position: "relative" }}>
        <div
          style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: "linear-gradient(90deg, #a855f7, #6366f1, #3b82f6)",
          }}
        />
        <CardHeader style={{ paddingBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(99,102,241,0.15))",
                  border: "1px solid rgba(168,85,247,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Sparkles style={{ width: 16, height: 16, color: "#a855f7" }} />
              </div>
              <div>
                <CardTitle style={{ fontSize: 15 }}>Portfolio Analysis</CardTitle>
                <CardDescription style={{ fontSize: 12, marginTop: 1 }}>
                  AI-powered insights into your investments
                </CardDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              style={{ fontSize: 10, gap: 4, borderColor: "rgba(168,85,247,0.3)", color: "#a855f7" }}
            >
              <Sparkles style={{ width: 9, height: 9 }} />
              Premium
            </Badge>
          </div>
        </CardHeader>
        <CardContent style={{ paddingTop: 0 }}>
          <button
            onClick={handleAnalyse}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 18px", borderRadius: 8, border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 13, fontWeight: 600, color: "#ffffff",
              background: loading
                ? "rgba(168,85,247,0.5)"
                : "linear-gradient(135deg, #a855f7, #6366f1)",
              transition: "opacity 0.15s ease",
              opacity: loading ? 0.8 : 1,
            }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = "0.88" }}
            onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = "1" }}
          >
            {loading
              ? <><Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> Analysing…</>
              : <><Sparkles style={{ width: 14, height: 14 }} /> Analyse Portfolio</>
            }
          </button>
        </CardContent>
      </Card>

      {/* Results — only shown after analysis */}
      {analysed && (
        <>
          {/* Metric cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {METRICS.map((m) => (
              <Card
                key={m.label}
                style={{
                  border: `1px solid ${m.color}22`,
                  backgroundColor: m.bg,
                }}
              >
                <CardContent style={{ padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ color: m.color }}>{m.icon}</div>
                    <span style={{ fontSize: 11, fontWeight: 500, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {m.label}
                    </span>
                  </div>
                  <p style={{ fontSize: 20, fontWeight: 700, color: m.color, fontFamily: "monospace", marginBottom: 4 }}>
                    {m.value}
                  </p>
                  <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>{m.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom row — sector + insights */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

            {/* Sector allocation */}
            <Card style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <CardHeader style={{ paddingBottom: 12 }}>
                <CardTitle style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                  <PieChart style={{ width: 14, height: 14, color: "hsl(var(--muted-foreground))" }} />
                  Sector Allocation
                </CardTitle>
              </CardHeader>
              <CardContent style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {SECTORS.map((s) => (
                  <div key={s.sector}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "hsl(var(--foreground))" }}>{s.sector}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "monospace", color: s.color }}>{s.percent}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${s.percent}%`,
                          borderRadius: 99,
                          backgroundColor: s.color,
                          transition: "width 0.6s ease",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <CardHeader style={{ paddingBottom: 12 }}>
                <CardTitle style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                  <Sparkles style={{ width: 14, height: 14, color: "#a855f7" }} />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {INSIGHTS.map((insight, i) => {
                  const { icon, color } = INSIGHT_STYLES[insight.type]
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 8,
                        padding: "8px 10px", borderRadius: 8,
                        backgroundColor: `${color}10`,
                        border: `1px solid ${color}20`,
                      }}
                    >
                      <span style={{ color, marginTop: 1 }}>{icon}</span>
                      <p style={{ fontSize: 12, color: "hsl(var(--foreground))", lineHeight: 1.5 }}>
                        {insight.text}
                      </p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

          </div>
        </>
      )}

      {/* Empty state before analysis */}
      {!analysed && !loading && (
        <div
          style={{
            padding: "48px 24px",
            borderRadius: 12,
            border: "1px dashed rgba(255,255,255,0.1)",
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 10, textAlign: "center",
          }}
        >
          <div
            style={{
              width: 48, height: 48, borderRadius: 14,
              backgroundColor: "rgba(168,85,247,0.08)",
              border: "1px solid rgba(168,85,247,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <PieChart style={{ width: 20, height: 20, color: "#a855f7" }} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 500, color: "hsl(var(--foreground))" }}>
            Ready to analyse your portfolio
          </p>
          <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
            Hit "Analyse Portfolio" to get AI-powered insights
          </p>
        </div>
      )}

    </div>
  )
}