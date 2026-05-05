"use client"

import { Lock, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

interface PremiumLockCardProps {
  title?: string
  description?: string
  ctaLabel?: string
  onUpgrade?: () => void
}

export function PremiumLockCard({
  title = "Unlock Portfolio Analytics",
  description = "Get AI-powered insights on your portfolio performance, risk, and diversification",
  ctaLabel = "Upgrade to Premium",
  onUpgrade,
}: PremiumLockCardProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 420,
        padding: "24px",
      }}
    >
      <Card
        style={{
          maxWidth: 420,
          width: "100%",
          border: "1px solid rgba(255,255,255,0.08)",
          backgroundColor: "hsl(var(--card))",
          textAlign: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Subtle gradient top bar */}
        <div
          style={{
            height: 3,
            background: "linear-gradient(90deg, #a855f7, #6366f1, #3b82f6)",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
          }}
        />

        <CardContent style={{ padding: "40px 32px 36px" }}>

          {/* Icon */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(99,102,241,0.15))",
              border: "1px solid rgba(168,85,247,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <Lock style={{ width: 22, height: 22, color: "#a855f7" }} />
          </div>

          {/* Text */}
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "hsl(var(--foreground))",
              marginBottom: 10,
              lineHeight: 1.3,
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: 13,
              color: "hsl(var(--muted-foreground))",
              lineHeight: 1.6,
              marginBottom: 28,
            }}
          >
            {description}
          </p>

          {/* Feature list */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: 28,
              textAlign: "left",
            }}
          >
            {[
              "Portfolio health scoring",
              "Risk & diversification analysis",
              "AI-generated rebalancing tips",
              "Sector exposure breakdown",
            ].map((feature) => (
              <div
                key={feature}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  color: "hsl(var(--muted-foreground))",
                }}
              >
                <Sparkles style={{ width: 12, height: 12, color: "#a855f7", flexShrink: 0 }} />
                {feature}
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/billing"
            style={{
              display: "block",
              width: "100%",
              padding: "10px 20px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              color: "#ffffff",
              background: "linear-gradient(135deg, #a855f7, #6366f1)",
              transition: "opacity 0.15s ease",
              textAlign: "center",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.88")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
          >
            {ctaLabel}
          </Link>

          <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", marginTop: 14 }}>
            Cancel anytime · Instant access
          </p>
        </CardContent>
      </Card>
    </div>
  )
}