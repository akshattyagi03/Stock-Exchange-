"use client"

import React, { useEffect, useState } from "react"
import { Activity, Loader2, Plus } from "lucide-react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import WatchlistSearch from "@/components/watchlist/WatchlistSearch"
import WatchlistTable from "@/components/watchlist/WatchlistTable"

interface WatchlistItem {
  instrumentKey: string
  symbol: string
}

interface WatchlistData {
  _id: string
  name: string
  stocks: WatchlistItem[]
}

interface EnrichedStock {
  instrumentKey: string
  symbol: string
  price: number
  change: number
  changePct: number
  volume: number
}

export default function WatchlistPage() {
  const [watchlists, setWatchlists] = useState<WatchlistData[]>([])
  const [activeWatchlistId, setActiveWatchlistId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newWatchlistName, setNewWatchlistName] = useState("")
  const [enrichedStocks, setEnrichedStocks] = useState<EnrichedStock[]>([])
  const [loadingStocks, setLoadingStocks] = useState(false)

  useEffect(() => {
    async function fetchWatchlists() {
      try {
        const res = await fetch("/api/watchlist")
        const data = await res.json()
        if (data.watchlists && data.watchlists.length > 0) {
          setWatchlists(data.watchlists)
          setActiveWatchlistId(data.watchlists[0]._id)
        }
      } catch (err) {
        console.error("Failed to fetch watchlists:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchWatchlists()
  }, [])

  useEffect(() => {
    async function fetchActiveWatchlistStocks() {
      if (!activeWatchlistId) return

      setLoadingStocks(true)
      const activeWatchlist = watchlists.find(w => w._id === activeWatchlistId)
      if (!activeWatchlist || activeWatchlist.stocks.length === 0) {
        setEnrichedStocks([])
        setLoadingStocks(false)
        return
      }

      try {
        const infoResults = await Promise.allSettled(
          activeWatchlist.stocks.map(item =>
            fetch(`/api/stocks/${encodeURIComponent(item.symbol)}/info`).then(r => r.json())
          )
        )

        const enriched: EnrichedStock[] = activeWatchlist.stocks.map((item, i) => {
          const result = infoResults[i]
          if (result.status === "fulfilled" && !result.value.error) {
            return {
              instrumentKey: item.instrumentKey,
              symbol: item.symbol,
              price: result.value.price ?? 0,
              change: result.value.change ?? 0,
              changePct: result.value.changePercent ?? 0,
              volume: result.value.volume ?? 0,
            }
          }
          return { instrumentKey: item.instrumentKey, symbol: item.symbol, price: 0, change: 0, changePct: 0, volume: 0 }
        })

        setEnrichedStocks(enriched)
      } catch (err) {
        console.error("Failed to fetch stock info:", err)
      } finally {
        setLoadingStocks(false)
      }
    }

    fetchActiveWatchlistStocks()
  }, [activeWatchlistId, watchlists])

  const handleCreateWatchlist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWatchlistName.trim()) return

    try {
      const res = await fetch("/api/watchlist/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newWatchlistName }),
      })
      const data = await res.json()

      if (!res.ok) { toast.error(data.error || "Failed to create watchlist"); return }

      setWatchlists([...watchlists, data.watchlist])
      setActiveWatchlistId(data.watchlist._id)
      setNewWatchlistName("")
      setIsCreating(false)
      toast.success("Watchlist created")
    } catch {
      toast.error("An error occurred")
    }
  }

  const handleRemoveStock = async (instrumentKey: string) => {
    try {
      const res = await fetch("/api/watchlist/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchlistId: activeWatchlistId, instrumentKey }),
      })
      const data = await res.json()

      if (!res.ok) { toast.error(data.error || "Failed to remove stock"); return }

      setWatchlists(prev => prev.map(w =>
        w._id === activeWatchlistId
          ? { ...w, stocks: w.stocks.filter(s => s.instrumentKey !== instrumentKey) }
          : w
      ))
      setEnrichedStocks(prev => prev.filter(s => s.instrumentKey !== instrumentKey))
      toast.success("Stock removed")
    } catch {
      toast.error("Failed to remove stock")
    }
  }

  const handleAddStock = async (instrument: { trading_symbol: string; instrument_key: string }) => {
    if (!activeWatchlistId) { toast.error("Please select a watchlist first"); return }

    try {
      const res = await fetch("/api/watchlist/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          watchlistId: activeWatchlistId,
          instrumentKey: instrument.instrument_key,
          symbol: instrument.trading_symbol,
        }),
      })
      const data = await res.json()

      if (!res.ok) { toast.error(data.error || "Failed to add stock"); return }

      setWatchlists(prev => prev.map(w =>
        w._id === activeWatchlistId
          ? { ...w, stocks: [...w.stocks, { instrumentKey: instrument.instrument_key, symbol: instrument.trading_symbol }] }
          : w
      ))
      toast.success("Stock added")
    } catch {
      toast.error("Failed to add stock")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="shrink-0">
            <h1 className="text-2xl font-bold">Watchlists</h1>
            <p className="text-sm text-muted-foreground">Manage your favorite stocks</p>
          </div>
          <WatchlistSearch onAddStock={handleAddStock} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Horizontal Watchlist Tabs */}
        <div className="flex items-center gap-6 border-b mb-6 overflow-x-auto">
          {watchlists.map(w => (
            <button
              key={w._id}
              onClick={() => setActiveWatchlistId(w._id)}
              className={`whitespace-nowrap pb-3 text-sm font-semibold transition-colors border-b-2 ${
                activeWatchlistId === w._id 
                  ? "border-[#4B4B6C] text-[#4B4B6C]" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {w.name}
            </button>
          ))}
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="whitespace-nowrap pb-3 text-sm text-[#00bda6] font-semibold flex items-center gap-1 hover:text-[#00bda6]/80 border-b-2 border-transparent"
          >
            <Plus size={16} strokeWidth={2.5} /> Watchlist
          </button>
        </div>

        {isCreating && (
          <form onSubmit={handleCreateWatchlist} className="mb-6 flex gap-2 max-w-sm">
            <Input 
              placeholder="List name" 
              value={newWatchlistName} 
              onChange={e => setNewWatchlistName(e.target.value)}
              className="h-9 text-sm"
              autoFocus
            />
            <Button type="submit" size="sm" className="h-9">Save</Button>
          </form>
        )}

        {/* Main Content */}
        <Card className="min-h-125">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="flex items-center gap-2">
              <Activity size={18} />
              {watchlists.find(w => w._id === activeWatchlistId)?.name || "Select a Watchlist"}
            </CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <WatchlistTable
              stocks={enrichedStocks}
              loading={loadingStocks}
              onRemove={handleRemoveStock}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}
