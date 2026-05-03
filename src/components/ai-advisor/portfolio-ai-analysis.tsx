"use client"

import { useState } from "react"
import { Loader2, Sparkles, PieChart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MarkdownText } from "./markdown-text"

export function PortfolioAnalyticsTab() {
  const [analysed, setAnalysed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")
  const [error, setError] = useState("")

  async function handleAnalyse() {
    setLoading(true)
    setAnalysed(false)
    setResult("")
    setError("")

    try {
      const res = await fetch("/api/ai/portfolio", { method: "POST" })

      if (res.status === 400) {
        setError("You have no holdings to analyse. Place some orders first.")
        setLoading(false)
        return
      }

      if (!res.ok) {
        setError("Failed to analyse portfolio. Please try again.")
        setLoading(false)
        return
      }

      if (!res.body) throw new Error("No stream")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let output = ""

      setAnalysed(true)
      setLoading(false)

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        output += decoder.decode(value, { stream: true })
        setResult(output)
      }
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
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
                  AI-powered insights based on your actual holdings
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

      {/* Error state */}
      {error && (
        <div style={{
          padding: "16px", borderRadius: 10,
          backgroundColor: "rgba(248,113,113,0.08)",
          border: "1px solid rgba(248,113,113,0.2)",
        }}>
          <p style={{ fontSize: 13, color: "#f87171" }}>{error}</p>
        </div>
      )}

      {/* Streaming result */}
      {analysed && result && (
        <Card style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <CardHeader style={{ paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                backgroundColor: "rgba(168,85,247,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Sparkles style={{ width: 13, height: 13, color: "#a855f7" }} />
              </div>
              <CardTitle style={{ fontSize: 13 }}>Analysis Results</CardTitle>
            </div>
          </CardHeader>
          <CardContent style={{ paddingTop: 16 }}>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: "hsl(var(--foreground))" }}>
              <MarkdownText text={result} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!analysed && !loading && !error && (
        <div
          style={{
            padding: "48px 24px", borderRadius: 12,
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
            Hit "Analyse Portfolio" to get AI-powered insights based on your actual holdings
          </p>
        </div>
      )}

    </div>
  )
}
