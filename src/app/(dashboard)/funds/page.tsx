"use client"
import { Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Order {
    _id: string
    orderId: string
    stockName: string
    quantity: number
    price: number
    executedPrice?: number
    orderType: "buy" | "sell"
    status: "pending" | "partially_executed" | "executed" | "cancelled"
    createdAt: string
}

export default function FundsAndBalances() {
    const [showBalance, setShowBalance] = useState(true)
    const [availableBalance, setAvailableBalance] = useState(0)
    const [frozenBalance, setFrozenBalance] = useState(0)
    const [totalBalance, setTotalBalance] = useState(0)
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [ordersLoading, setOrdersLoading] = useState(true)

    useEffect(() => {
        async function fetchFunds() {
            try {
                const res = await fetch("/api/funds")
                const data = await res.json()
                if (!data.error) {
                    setAvailableBalance(data.availableBalance)
                    setFrozenBalance(data.frozenBalance)
                    setTotalBalance(data.totalBalance)
                }
            } catch (error) {
                console.error("Failed to fetch funds:", error)
            } finally {
                setLoading(false)
            }
        }

        async function fetchOrders() {
            try {
                const res = await fetch("/api/get-orders")
                const data = await res.json()
                if (data.success) {
                    setOrders(data.orders.slice(0, 10))
                }
            } catch (error) {
                console.error("Failed to fetch orders:", error)
            } finally {
                setOrdersLoading(false)
            }
        }

        fetchFunds()
        fetchOrders()
    }, [])

    const formatCurrency = (value: number) =>
        value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        })

    const statusColor: Record<string, string> = {
        executed: "bg-green-500/10 text-green-400 border-green-500/30",
        pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
        partially_executed: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Funds & Balances</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage your account funds and view transaction history</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Total Balance */}
                <div className="mb-8">
                    <Card className="border-border/40 bg-linear-to-br from-card/80 to-card/40 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Balance</p>
                                    <div className="flex items-baseline gap-3 mt-2">
                                        <p className="text-4xl font-bold text-foreground">
                                            {loading ? "Loading..." : showBalance ? `₹${formatCurrency(totalBalance)}` : "••••••••"}
                                        </p>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">Available + Frozen</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-border/40 h-9 w-9 p-0"
                                        onClick={() => setShowBalance(!showBalance)}
                                    >
                                        {showBalance ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
                        <CardHeader className="pb-3 border-b border-border/40">
                            <CardTitle className="text-sm font-semibold">Available Balance</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-2xl font-bold" style={{ color: "#4ade80" }}>
                                {loading ? "—" : showBalance ? `₹${formatCurrency(availableBalance)}` : "••••••••"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Ready to use for trading</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
                        <CardHeader className="pb-3 border-b border-border/40">
                            <CardTitle className="text-sm font-semibold">Locked in pending orders</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-2xl font-bold" style={{ color: "#f87171" }}>
                                {loading ? "—" : showBalance ? `₹${formatCurrency(frozenBalance)}` : "••••••••"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Frozen balance reserved for open orders</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
                    <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="text-lg">Recent Orders</CardTitle>
                    </CardHeader>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/40 bg-muted/20">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Qty</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                                    <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ordersLoading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground text-xs">Loading orders...</td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground text-xs">No orders found.</td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order._id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                                            <td className="px-6 py-4 text-xs text-muted-foreground">{formatDate(order.createdAt)}</td>
                                            <td className="px-4 py-4 font-semibold text-xs">{order.stockName}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${order.orderType === "buy" ? "bg-green-400" : "bg-red-400"}`} />
                                                    <span className="text-xs font-medium capitalize">{order.orderType}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right font-mono text-xs">{order.quantity}</td>
                                            <td className="px-4 py-4 text-right font-mono text-xs">₹{formatCurrency(order.executedPrice ?? order.price)}</td>
                                            <td className="px-4 py-4 text-right font-mono text-xs">
                                                <span className={order.orderType === "buy" ? "text-red-400" : "text-green-400"}>
                                                    {order.orderType === "buy" ? "-" : "+"}₹{formatCurrency((order.executedPrice ?? order.price) * order.quantity)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge variant="outline" className={`text-xs ${statusColor[order.status]}`}>
                                                    {order.status.replace("_", " ")}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    )
}
