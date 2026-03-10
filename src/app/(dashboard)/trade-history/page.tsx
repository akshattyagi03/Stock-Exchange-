"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Trade = {
  _id: string
  symbol: string
  side: "BUY" | "SELL"
  quantity: number
  price: number
  status: string
  createdAt: string
}

export default function TradeHistoryPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await axios.get("/api/trades")
        setTrades(res.data.trades)
      } catch (error) {
        console.error("Failed to fetch trades", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrades()
  }, [])

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading trades...</p>
          ) : trades.length === 0 ? (
            <p className="text-muted-foreground">
              No executed trades yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {trades.map((trade) => (
                  <TableRow key={trade._id}>
                    <TableCell className="font-medium">
                      {trade.symbol}
                    </TableCell>

                    <TableCell
                      className={
                        trade.side === "BUY"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {trade.side}
                    </TableCell>

                    <TableCell>{trade.quantity}</TableCell>

                    <TableCell>₹{trade.price}</TableCell>

                    <TableCell>
                      ₹{trade.quantity * trade.price}
                    </TableCell>

                    <TableCell>
                      {new Date(trade.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}