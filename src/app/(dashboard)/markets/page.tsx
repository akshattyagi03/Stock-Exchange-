"use client"

import { useEffect, useState, useRef } from "react"
import { TrendingUp, TrendingDown, Activity, Loader2, Search, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Instrument {
    trading_symbol: string
    name: string
    instrument_key: string
}

interface Stock {
    instrumentKey: string
    symbol: string
    name: string
    price: number
    change: number
    changeValue: number
}

interface MarketIndex {
    name: string
    value?: number
    change: number
    points: number
}

export default function Markets() {
    const [stocks, setStocks] = useState<Stock[]>([])
    const [loading, setLoading] = useState(true)
    const [source, setSource] = useState<string>("")
    const [indices, setIndices] = useState<MarketIndex[]>([])

    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<Instrument[]>([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [insight, setInsight] = useState<string>("")
    const [insightLoading, setInsightLoading] = useState(false)

    const searchRef = useRef<HTMLDivElement>(null)
    const insightFetched = useRef(false)
    const router = useRouter()

    // 🔍 Search
    useEffect(() => {
        if (!searchQuery.trim()) {
            return
        }

        const timeout = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
                const data = await res.json()
                setSearchResults(data.results || [])
                setShowDropdown(true)
            } catch {
                setSearchResults([])
            }
        }, 250)

        return () => clearTimeout(timeout)
    }, [searchQuery])

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowDropdown(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // 📊 Fetch Markets + Indices
    useEffect(() => {
        const load = async () => {
            try {
                const [stocksRes, indicesRes] = await Promise.all([
                    fetch("/api/markets"),
                    fetch("/api/indices"),
                ])

                const stocksData = await stocksRes.json()
                const indicesData = await indicesRes.json()

                const fetchedIndices = indicesData.indices || []
                const fetchedStocks = stocksData.stocks || []
                setStocks(fetchedStocks)
                setIndices(fetchedIndices)
                setSource(stocksData.source)
                setLoading(false)

                if (fetchedIndices.length > 0 && !insightFetched.current) {
                    insightFetched.current = true
                    setInsightLoading(true)
                    fetch("/api/ai/market-insight", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            indices: fetchedIndices,
                            gainers: fetchedStocks.filter((s: Stock) => s.change >= 0).length,
                            losers: fetchedStocks.filter((s: Stock) => s.change < 0).length,
                        }),
                    })
                        .then(r => r.json())
                        .then(d => setInsight(d.insight || ""))
                        .catch(() => { insightFetched.current = false })
                        .finally(() => setInsightLoading(false))
                }
            } catch (err) {
                console.error("Fetch error:", err)
                setLoading(false)
            }
        }

        load()
        const interval = setInterval(load, 5000)

        return () => clearInterval(interval)
    }, [])

    const gainers = stocks.filter(s => s.change >= 0)
    const losers = stocks.filter(s => s.change < 0)

    return (
        <div className="min-h-screen bg-background">

            {/* Header */}
            <div className="border-b bg-card/50 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">

                    {/* Left */}
                    <div className="shrink-0">
                        <h1 className="text-2xl font-bold">Markets</h1>
                        <p className="text-sm text-muted-foreground">Live market data</p>
                    </div>

                    {/* Search */}
                    <div className="relative w-full max-w-md mx-4" ref={searchRef}>
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                const value = e.target.value
                                setSearchQuery(value)
                                if (!value.trim()) {
                                    setSearchResults([])
                                    setShowDropdown(false)
                                    return
                                }
                                setShowDropdown(true)
                            }}
                            onFocus={() => setShowDropdown(true)}
                            placeholder="Search stocks by name or symbol..."
                            className="w-full pl-11 pr-4 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                        />

                        {showDropdown && searchResults.length > 0 && (
                            <div className="absolute top-full mt-1 w-full bg-card border rounded-lg shadow-lg z-100 max-h-72 overflow-y-auto">
                                {searchResults.map((item) => (
                                    <div
                                        key={item.instrument_key}
                                        className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 cursor-pointer"
                                        onClick={() => {
                                            setShowDropdown(false)
                                            setSearchQuery("")
                                            router.push(`/markets/${item.trading_symbol}?key=${item.instrument_key}`)
                                        }}
                                    >
                                        <div>
                                            <p className="text-sm font-semibold">{item.trading_symbol}</p>
                                            <p className="text-xs text-muted-foreground">{item.name}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground">NSE</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3 shrink-0">
                        {source && (
                            <span className="text-xs text-yellow-400">
                                {source === "cache" ? "Cached" : source === "stale-cache" ? "Stale" : "Live"}
                            </span>
                        )}
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1" />
                            Live
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Indices */}
            <div className="max-w-7xl mx-auto px-4 pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {indices.map((index) => (
                        <div key={index.name} className="p-4 rounded-xl border bg-card hover:bg-muted/20 transition">
                            <p className="text-xs text-muted-foreground">{index.name}</p>
                            <p className="text-lg font-bold mt-1">{index.value?.toLocaleString("en-IN")}</p>
                            <p className={`text-sm font-semibold mt-1 ${index.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                                {index.change >= 0 ? "+" : ""}{index.change}% ({index.points})
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main */}
            <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Stocks */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-2">
                                <Activity size={18} /> All Stocks
                            </CardTitle>
                            <div className="text-xs">
                                <span className="text-green-400 mr-2">▲ {gainers.length}</span>
                                <span className="text-red-400">▼ {losers.length}</span>
                            </div>
                        </CardHeader>

                        <Tabs defaultValue="all">
                            <TabsList className="ml-4">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="gainers">Gainers</TabsTrigger>
                                <TabsTrigger value="losers">Losers</TabsTrigger>
                            </TabsList>

                            {loading ? (
                                <div className="flex justify-center items-center py-16 text-muted-foreground">
                                    <Loader2 className="animate-spin mr-2" /> Loading...
                                </div>
                            ) : (
                                ["all", "gainers", "losers"].map(tab => {
                                    const filtered = tab === "all" ? stocks : tab === "gainers" ? gainers : losers

                                    return (
                                        <TabsContent key={tab} value={tab}>
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left p-3">Symbol</th>
                                                        <th className="text-left">Name</th>
                                                        <th className="text-right">Price</th>
                                                        <th className="text-right">Change</th>
                                                        <th className="text-center">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filtered.map(stock => (
                                                        <tr key={stock.instrumentKey} className="border-b hover:bg-muted/20">
                                                            <td className="p-3 font-semibold">
                                                                <Link href={`/markets/${stock.symbol}?key=${stock.instrumentKey}`}>
                                                                    <span className="cursor-pointer hover:text-blue-400 hover:underline">
                                                                        {stock.symbol}
                                                                    </span>
                                                                </Link>
                                                            </td>
                                                            <td>{stock.name}</td>
                                                            <td className="text-right font-mono">₹{stock.price.toLocaleString()}</td>
                                                            <td className={`text-right ${stock.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                                                                {stock.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                                {stock.change.toFixed(2)}%
                                                            </td>
                                                            <td className="text-center">
                                                                <Button asChild size="sm" variant="outline">
                                                                    <Link href={`/markets/${stock.symbol}?key=${stock.instrumentKey}`}>
                                                                        Trade
                                                                    </Link>
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>

                                            {filtered.length === 0 && (
                                                <p className="text-center py-10 text-muted-foreground">No data</p>
                                            )}
                                        </TabsContent>
                                    )
                                })
                            )}
                        </Tabs>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles size={16} className="text-yellow-400" /> Market Insight
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {insightLoading ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 size={14} className="animate-spin" /> Generating insight...
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground leading-relaxed">{insight || "—"}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

