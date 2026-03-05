"use client"

import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
interface Stock {
    symbol: string
    name: string
    price: number
    change: number
}

export default function MarketsPage() {
    const [stocks, setStocks] = useState<Stock[]>([])
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const fetchStocks = async () => {
            const res = await fetch("/api/markets")
            const data = await res.json()
            if (res.ok) {
                setStocks(data.stocks)
                setLoading(false);
            }
        }
        fetchStocks()
        const interval = setInterval(fetchStocks, 10000)
        return () => clearInterval(interval)
    }, [])
    if (loading) return <div className="p-6">Loading markets...<Loader2 className="animate-spin" /></div>
    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-6">Markets</h1>

            <div className="rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="border-b bg-muted">
                        <tr>
                            <th className="text-left p-3">Symbol</th>
                            <th className="text-left p-3">Name</th>
                            <th className="text-left p-3">Price</th>
                            <th className="text-left p-3">Change</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.map((stock) => (
                            <tr key={stock.symbol} className="border-b hover:bg-muted/50">
                                <td className="p-3 font-medium">{stock.symbol}</td>
                                <td className="p-3">{stock.name}</td>
                                <td className="p-3">₹ {stock.price}</td>
                                <td
                                    className={`p-3 ${stock.change >= 0 ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    {stock.change}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}