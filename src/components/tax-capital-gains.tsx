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

const taxEntries: TaxEntry[] = [
  {
    label: "Redeemable gains",
    stcg: "₹0",
    ltcg: "₹2,312",
    tooltip: "Gains from investments you can currently redeem",
  },
  {
    label: "Invested gains",
    stcg: "₹0",
    ltcg: "₹0",
    tooltip: "Gains still locked in active investments",
  },
  {
    label: "Tax applicable",
    stcg: "20%",
    ltcg: "12.5%",
    tooltip: "STCG taxed at 20%, LTCG over ₹1.25L taxed at 12.5%",
  },
  {
    label: "Estimated tax",
    stcg: "₹0",
    ltcg: "₹0",
    tooltip: "Estimated tax after ₹1.25L LTCG exemption",
  },
]

const summaryCards = [
  { label: "Total invested", value: "₹35,998", sub: "Across 3 funds" },
  { label: "Current value", value: "₹33,726", sub: "As of today" },
  { label: "Overall P&L", value: "−₹2,272", sub: "−6.31%", negative: true },
  { label: "1Y XIRR", value: "−18.4%", sub: "Annualised return", negative: true },
]

export default function TaxCapitalGains() {
  return (
    <div className="space-y-6">

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryCards.map((c) => (
          <div key={c.label} className="bg-white/4 rounded-xl px-4 py-3 border border-white/6">
            <p className="text-xs text-white/40 mb-1">{c.label}</p>
            <p className={`text-lg font-bold ${c.negative ? "text-red-400" : "text-white"}`}>
              {c.value}
            </p>
            <p className={`text-xs mt-0.5 ${c.negative ? "text-red-400/70" : "text-white/40"}`}>
              {c.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Tax table */}
      <div>
        <h3 className="text-base font-bold mb-3">Capital Gains Breakdown</h3>
        <div className="rounded-xl border border-white/8 overflow-hidden">
          <div className="grid grid-cols-3 bg-white/4 px-4 py-2.5 text-xs font-semibold text-white/40 uppercase tracking-widest">
            <span></span>
            <span className="text-center">STCG</span>
            <span className="text-center">LTCG</span>
          </div>
          <Separator className="bg-white/6" />
          {taxEntries.map((entry, i) => (
            <div key={entry.label}>
              <div className="grid grid-cols-3 px-4 py-3 items-center hover:bg-white/2 transition-colors">
                <div className="flex items-center gap-1.5 text-sm text-white/70">
                  {entry.label}
                  {entry.tooltip && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="size-3 text-white/30" />
                        </TooltipTrigger>
                        <TooltipContent className="text-xs max-w-xs">
                          {entry.tooltip}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <span className="text-center text-sm font-semibold">{entry.stcg}</span>
                <span className="text-center text-sm font-semibold">{entry.ltcg}</span>
              </div>
              {i < taxEntries.length - 1 && <Separator className="bg-white/4" />}
            </div>
          ))}
        </div>

        <p className="text-xs text-white/30 mt-3 leading-relaxed">
          LTCG up to ₹1.25 lakh per year is exempt from tax. Tax estimates are indicative only.
          Consult a tax advisor for accurate filing.
        </p>
      </div>
    </div>
  )
}