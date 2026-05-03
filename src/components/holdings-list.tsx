"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export interface AnalyticsHolding {
  symbol: string
  name: string
  category: string
  quantity: number
  averageBuyPrice: number
  currentPrice: number
  invested: number
  currentValue: number
  overallPnL: number
}

const formatCurrency = (value: number, maximumFractionDigits = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits,
  }).format(value)

function HoldingRow({ h }: { h: AnalyticsHolding }) {
  const [open, setOpen] = useState(false)
  const pnlPct =
    h.invested > 0 ? ((h.overallPnL / h.invested) * 100).toFixed(2) : "0.00"
  const isProfit = h.overallPnL >= 0

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-muted/30"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
          <span className="text-xs font-bold text-foreground/70">
            {h.symbol.slice(0, 2)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{h.symbol}</p>
          <p className="truncate text-xs text-muted-foreground">{h.name}</p>
        </div>
        <Badge
          variant="outline"
          className="hidden border-border/40 text-[10px] text-muted-foreground sm:inline-flex"
        >
          {h.category}
        </Badge>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold">
            {formatCurrency(h.currentValue)}
          </p>
          <p
            className={`text-xs font-medium ${
              isProfit ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isProfit ? "+" : ""}
            {formatCurrency(Math.abs(h.overallPnL))} ({isProfit ? "+" : ""}
            {pnlPct}%)
          </p>
        </div>
        {open ? (
          <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {open && (
        <>
          <Separator />
          <div className="grid grid-cols-2 gap-px bg-border/50 sm:grid-cols-4">
            {[
              { label: "Units", value: h.quantity.toFixed(2) },
              { label: "Avg. Price", value: formatCurrency(h.averageBuyPrice, 2) },
              { label: "Current Price", value: formatCurrency(h.currentPrice, 2) },
              { label: "Invested", value: formatCurrency(h.invested) },
            ].map((item) => (
              <div key={item.label} className="bg-card px-4 py-3">
                <p className="mb-1 text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function HoldingsList({
  holdings,
}: {
  holdings: AnalyticsHolding[]
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Holdings</h2>
        <span className="text-xs text-muted-foreground">
          {holdings.length} stock{holdings.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-2">
        {holdings.length > 0 ? (
          holdings.map((h) => <HoldingRow key={h.symbol} h={h} />)
        ) : (
          <div className="rounded-xl border border-border px-4 py-6 text-center text-sm text-muted-foreground">
            No holdings found.
          </div>
        )}
      </div>
    </div>
  )
}
