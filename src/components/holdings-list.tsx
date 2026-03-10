"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Holding {
  symbol: string
  name: string
  category: string
  units: number
  avgPrice: number
  currentPrice: number
  invested: number
  current: number
}

const holdings: Holding[] = [
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd",
    category: "Equity",
    units: 12.5,
    avgPrice: 1680,
    currentPrice: 1622,
    invested: 21000,
    current: 20275,
  },
  {
    symbol: "INFY",
    name: "Infosys Ltd",
    category: "Equity",
    units: 5.8,
    avgPrice: 1520,
    currentPrice: 1489,
    invested: 8816,
    current: 8636.2,
  },
  {
    symbol: "NIFTYBEES",
    name: "Nippon India ETF Nifty BeES",
    category: "Others",
    units: 30,
    avgPrice: 207,
    currentPrice: 214.5,
    invested: 6210,
    current: 6435,
  },
]

function HoldingRow({ h }: { h: Holding }) {
  const [open, setOpen] = useState(false)
  const pnl = h.current - h.invested
  const pnlPct = ((pnl / h.invested) * 100).toFixed(2)
  const isProfit = pnl >= 0

  return (
    <div className="border border-white/[0.07] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-white/3 transition-colors text-left"
      >
        <div className="size-9 rounded-lg bg-white/6 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-white/70">{h.symbol.slice(0, 2)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{h.symbol}</p>
          <p className="text-xs text-white/40 truncate">{h.name}</p>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] border-white/10 text-white/40 hidden sm:inline-flex"
        >
          {h.category}
        </Badge>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold">₹{h.current.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          <p className={`text-xs font-medium ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
            {isProfit ? "+" : ""}₹{Math.abs(pnl).toLocaleString("en-IN", { maximumFractionDigits: 0 })} ({isProfit ? "+" : ""}{pnlPct}%)
          </p>
        </div>
        {open ? (
          <ChevronUp className="size-4 text-white/30 shrink-0" />
        ) : (
          <ChevronDown className="size-4 text-white/30 shrink-0" />
        )}
      </button>

      {open && (
        <>
          <Separator className="bg-white/6" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5">
            {[
              { label: "Units", value: h.units.toFixed(2) },
              { label: "Avg. Price", value: `₹${h.avgPrice.toLocaleString("en-IN")}` },
              { label: "Current Price", value: `₹${h.currentPrice.toLocaleString("en-IN")}` },
              { label: "Invested", value: `₹${h.invested.toLocaleString("en-IN")}` },
            ].map((item) => (
              <div key={item.label} className="bg-[#0d1117] px-4 py-3">
                <p className="text-xs text-white/40 mb-1">{item.label}</p>
                <p className="text-sm font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function HoldingsList() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Holdings</h2>
        <span className="text-xs text-white/40">{holdings.length} stocks</span>
      </div>
      <div className="space-y-2">
        {holdings.map((h) => (
          <HoldingRow key={h.symbol} h={h} />
        ))}
      </div>
    </div>
  )
}