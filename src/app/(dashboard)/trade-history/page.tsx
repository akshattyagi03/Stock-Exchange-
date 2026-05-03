"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Order = {
  _id: string
  stockName: string
  orderType: "buy" | "sell"
  quantity: number
  executedQuantity: number
  price: number
  executedPrice?: number
  status: "pending" | "partially_executed" | "executed"
  createdAt: string
  executedAt?: string
}

const statusColor: Record<string, string> = {
  executed: "bg-green-500/10 text-green-400 border-green-500/30",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  partially_executed: "bg-blue-500/10 text-blue-400 border-blue-500/30",
}

export default function TradeHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/get-orders")
        const data = await res.json()
        if (data.success) {
          const filtered = data.orders.filter(
            (o: any) => o.status !== "cancelled"
          )
          setOrders(filtered)
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const formatCurrency = (value: number) =>
    value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
          <p className="text-sm text-muted-foreground">All orders excluding cancelled</p>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading trades...</p>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No trades found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Executed Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {orders.map((order) => {
                  const price = order.executedPrice ?? order.price
                  const qty = order.executedQuantity || order.quantity
                  return (
                    <TableRow key={order._id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="font-semibold">{order.stockName}</TableCell>
                      <TableCell className={order.orderType === "buy" ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                        {order.orderType.toUpperCase()}
                      </TableCell>
                      <TableCell className="text-right font-mono">{qty}</TableCell>
                      <TableCell className="text-right font-mono">₹{formatCurrency(order.price)}</TableCell>
                      <TableCell className="text-right font-mono">
                        {order.executedPrice ? `₹${formatCurrency(order.executedPrice)}` : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        <span className={order.orderType === "buy" ? "text-red-400" : "text-green-400"}>
                          {order.orderType === "buy" ? "-" : "+"}₹{formatCurrency(price * qty)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`text-xs ${statusColor[order.status]}`}>
                          {order.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
