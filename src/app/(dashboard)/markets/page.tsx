"use client"
import Link from "next/link"
import { Loader2, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Stock {
    symbol: string
    name: string
    price: number
    change: number
}

interface Index {
    symbol: string
    name: string
    value: number
    change: number
    points: number
}

export default function MarketsPage() {
    const [stocks, setStocks] = useState<Stock[]>([])
    const [indices, setIndices] = useState<Index[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                const [stocksRes, indicesRes] = await Promise.all([
                    fetch("/api/markets"),
                    fetch("/api/indices"),
                ])

                if (!stocksRes.ok || !indicesRes.ok) {
                    console.error("API request failed")
                    return
                }

                const stocksData = await stocksRes.json()
                const indicesData = await indicesRes.json()

                setStocks(stocksData.stocks ?? [])
                setIndices(indicesData.indices ?? [])

                setLoading(false)
            } catch (error) {
                console.error("Fetch error:", error)
            }
        }

        fetchMarketData()

        const interval = setInterval(fetchMarketData, 10000)

        return () => clearInterval(interval)
    }, [])

    const gainers = stocks.filter(s => s.change >= 0)
    const losers = stocks.filter(s => s.change < 0)

    return (
        <div className="min-h-screen bg-background p-6 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Markets</h1>
                    <p className="text-muted-foreground text-sm mt-1">NSE & BSE · Live prices</p>
                </div>
                <Badge variant="outline" className="gap-1.5 text-xs">
                    <span className="size-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                    Live
                </Badge>
            </div>

            {/* Index Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {indices.map((index) => (
                    <Card key={index.symbol} className="border-border/60">
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{index.name}</p>
                            <p className="text-xl font-bold mt-1 tabular-nums">
                                {index.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </p>
                            <div className={`flex items-center gap-1 mt-1 text-sm font-medium ${index.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                                {index.change >= 0
                                    ? <TrendingUp className="size-3.5" />
                                    : <TrendingDown className="size-3.5" />}
                                <span>{index.change > 0 ? "+" : ""}{index.change.toFixed(2)}%</span>
                                <span className="text-muted-foreground font-normal text-xs">
                                    ({index.points > 0 ? "+" : ""}{index.points.toFixed(2)})
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Stocks Table */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Activity className="size-4" />
                            Stocks
                        </CardTitle>
                        {!loading && (
                            <div className="flex gap-3 text-xs text-muted-foreground">
                                <span className="text-green-500 font-medium">▲ {gainers.length} gaining</span>
                                <span className="text-red-500 font-medium">▼ {losers.length} falling</span>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <Separator />

                <Tabs defaultValue="all">
                    <div className="px-6 pt-3">
                        <TabsList className="h-8">
                            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                            <TabsTrigger value="gainers" className="text-xs">Gainers</TabsTrigger>
                            <TabsTrigger value="losers" className="text-xs">Losers</TabsTrigger>
                        </TabsList>
                    </div>

                    {loading ? (
                        <CardContent className="flex items-center justify-center py-16 text-muted-foreground gap-2">
                            <Loader2 className="size-4 animate-spin" />
                            <span className="text-sm">Fetching live prices…</span>
                        </CardContent>
                    ) : (
                        <>
                            {(["all", "gainers", "losers"] as const).map((tab) => {
                                const filtered = tab === "all" ? stocks : tab === "gainers" ? gainers : losers
                                return (
                                    <TabsContent key={tab} value={tab} className="mt-0">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b bg-muted/40">
                                                    <th className="text-left px-6 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Symbol</th>
                                                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</th>
                                                    <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Price</th>
                                                    <th className="text-right px-6 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Change</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filtered.map((stock) => (
                                                    <tr key={stock.symbol} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                        <td className="px-6 py-3.5 font-semibold">
                                                            <Link href={`/markets/${stock.symbol}`} className="hover:underline underline-offset-4">
                                                                {stock.symbol}
                                                            </Link>
                                                        </td>
                                                        <td className="px-4 py-3.5 text-muted-foreground">{stock.name}</td>
                                                        <td className="px-4 py-3.5 text-right font-mono tabular-nums">
                                                            ₹{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="px-6 py-3.5 text-right">
                                                            <span className={`inline-flex items-center gap-1 font-medium tabular-nums ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                                                                {stock.change >= 0
                                                                    ? <TrendingUp className="size-3.5" />
                                                                    : <TrendingDown className="size-3.5" />}
                                                                {stock.change > 0 ? "+" : ""}{stock.change.toFixed(2)}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {filtered.length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground text-sm">
                                                            No stocks in this category
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </TabsContent>
                                )
                            })}
                        </>
                    )}
                </Tabs>
            </Card>
        </div>
    )
}