"use client"

import { Loader2, Trash2, TrendingDown, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EnrichedStock {
  instrumentKey: string
  symbol: string
  price: number
  change: number
  changePct: number
  volume: number
}

interface Props {
  stocks: EnrichedStock[]
  loading: boolean
  onRemove: (instrumentKey: string) => void
}

function fmtVolume(v: number) {
  if (v >= 10_000_000) return (v / 10_000_000).toFixed(1) + " Cr"
  if (v >= 100_000) return (v / 100_000).toFixed(1) + " L"
  return v.toLocaleString("en-IN")
}

export default function WatchlistTable({ stocks, loading, onRemove }: Props) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" /> Loading stocks...
      </div>
    )
  }

  if (stocks.length === 0) {
    return (
      <div className="text-center py-24 border-2 border-dashed rounded-lg mt-4 text-muted-foreground">
        This watchlist is empty. Search above to add stocks.
      </div>
    )
  }

  return (
    <table className="w-full text-sm mt-4">
      <thead>
        <tr className="border-b">
          <th className="text-left p-3 text-muted-foreground font-medium">Symbol</th>
          <th className="text-right text-muted-foreground font-medium">Price</th>
          <th className="text-right text-muted-foreground font-medium">Change</th>
          <th className="text-right text-muted-foreground font-medium">Volume</th>
          <th className="text-center text-muted-foreground font-medium">Action</th>
        </tr>
      </thead>
      <tbody>
        {stocks.map(stock => (
          <tr key={stock.instrumentKey} className="border-b hover:bg-muted/20 transition-colors">
            <td className="p-3 font-semibold">
              <Link href={`/markets/${stock.symbol}`}>
                <span className="cursor-pointer hover:text-blue-400 hover:underline">{stock.symbol}</span>
              </Link>
            </td>
            <td className="text-right font-mono">
              ₹{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
            <td className={`text-right font-mono ${stock.change >= 0 ? "text-green-400" : "text-red-400"}`}>
              <div className="flex items-center justify-end gap-1">
                {stock.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {stock.change.toFixed(2)}%
              </div>
            </td>
            <td className="text-right text-muted-foreground font-mono">{fmtVolume(stock.volume)}</td>
            <td className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Button asChild size="sm" variant="outline" className="h-8">
                  <Link href={`/markets/${stock.symbol}`}>Trade</Link>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                  onClick={() => onRemove(stock.instrumentKey)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
