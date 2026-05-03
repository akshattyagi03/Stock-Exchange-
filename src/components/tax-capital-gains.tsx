"use client"

import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

interface TaxEntry {
  label: string
  stcg: string
  ltcg: string
  tooltip?: string
}

export interface TaxSummary {
  totalPortfolioValue: number
  totalInvested: number
  overallPnL: number
}

const formatCurrency = (value: number, maximumFractionDigits = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits,
  }).format(value)

export default function TaxCapitalGains({
  summary,
  holdingsCount,
}: {
  summary: TaxSummary
  holdingsCount: number
}) {
  const gains = Math.max(summary.overallPnL, 0)
  const ltcgExemption = 125000
  const taxableLtcg = Math.max(gains - ltcgExemption, 0)
  const estimatedLtcgTax = taxableLtcg * 0.125
  const pnlPct =
    summary.totalInvested > 0
      ? (summary.overallPnL / summary.totalInvested) * 100
      : 0

  const taxEntries: TaxEntry[] = [
    {
      label: "Redeemable gains",
      stcg: formatCurrency(0),
      ltcg: formatCurrency(gains),
      tooltip: "Indicative unrealised gains from current holdings.",
    },
    {
      label: "Invested gains",
      stcg: formatCurrency(0),
      ltcg: formatCurrency(gains),
      tooltip: "Gains still locked in active investments.",
    },
    {
      label: "Tax applicable",
      stcg: "20%",
      ltcg: "12.5%",
      tooltip: "STCG taxed at 20%, LTCG over Rs.1.25L taxed at 12.5%.",
    },
    {
      label: "Estimated tax",
      stcg: formatCurrency(0),
      ltcg: formatCurrency(estimatedLtcgTax),
      tooltip: "Estimated LTCG tax after the Rs.1.25L exemption.",
    },
  ]

  const summaryCards = [
    {
      label: "Total invested",
      value: formatCurrency(summary.totalInvested),
      sub: `Across ${holdingsCount} holding${holdingsCount !== 1 ? "s" : ""}`,
    },
    {
      label: "Current value",
      value: formatCurrency(summary.totalPortfolioValue),
      sub: "As of today",
    },
    {
      label: "Overall P&L",
      value: formatCurrency(summary.overallPnL),
      sub: `${pnlPct.toFixed(2)}%`,
      negative: summary.overallPnL < 0,
    },
    {
      label: "Indicative tax",
      value: formatCurrency(estimatedLtcgTax),
      sub: "Not filing advice",
      negative: false,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {summaryCards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-card px-4 py-3">
            <p className="mb-1 text-xs text-muted-foreground">{c.label}</p>
            <p className={`text-lg font-bold ${c.negative ? "text-destructive" : "text-foreground"}`}>
              {c.value}
            </p>
            <p className={`mt-0.5 text-xs ${c.negative ? "text-destructive/70" : "text-muted-foreground"}`}>
              {c.sub}
            </p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="mb-3 text-base font-bold">Capital Gains Breakdown</h3>
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="grid grid-cols-3 bg-muted/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <span />
            <span className="text-center">STCG</span>
            <span className="text-center">LTCG</span>
          </div>
          <Separator />
          {taxEntries.map((entry, i) => (
            <div key={entry.label}>
              <div className="grid grid-cols-3 items-center px-4 py-3 transition-colors hover:bg-muted/30">
                <div className="flex items-center gap-1.5 text-sm text-foreground/80">
                  {entry.label}
                  {entry.tooltip && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="size-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-xs">
                          {entry.tooltip}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <span className="text-center text-sm font-semibold">{entry.stcg}</span>
                <span className="text-center text-sm font-semibold">{entry.ltcg}</span>
              </div>
              {i < taxEntries.length - 1 && <Separator />}
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Tax estimates are indicative only because holdings do not currently
          include lot age or realised-sale history. Consult a tax advisor for
          accurate filing.
        </p>
      </div>
    </div>
  )
}
