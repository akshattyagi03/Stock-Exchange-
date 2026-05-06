"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface OrderTicketProps {
  stockName: string
  defaultPrice?: number
}

const COLORS = {
  buy: {
    accent: "#10b981",      // emerald-500
    accentHover: "#059669", // emerald-600
    accentLight: "rgba(16,185,129,0.12)",
  },
  sell: {
    accent: "#f43f5e",      // rose-500
    accentHover: "#e11d48", // rose-600
    accentLight: "rgba(244,63,94,0.12)",
  },
}

export default function OrderTicket({ stockName, defaultPrice }: OrderTicketProps) {
  const router = useRouter()
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy")
  const [quantity, setQuantity] = useState("1")
  const [price, setPrice] = useState("")
  const [currentPrice, setCurrentPrice] = useState<number | null>(defaultPrice ?? null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredType, setHoveredType] = useState<"buy" | "sell" | null>(null)

  useEffect(() => {
    if (defaultPrice) {
      setCurrentPrice(defaultPrice)
      return
    }
    fetch(`/api/stocks/${stockName}/info`)
      .then(r => r.json())
      .then(data => {
        if (data?.price) {
          setCurrentPrice(data.price)
        }
      })
      .catch(() => {})
  }, [stockName, defaultPrice])

  const isMarketOrder = !price
  const effectivePrice = price ? Number(price) : (currentPrice ?? 0)
  const estimatedValue =
    Number(quantity) > 0 && effectivePrice > 0
      ? Number(quantity) * effectivePrice
      : 0

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockName,
          quantity: Number(quantity),
          price: price ? Number(price) : null,
          orderType,
          isMarketOrder,
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to place order")
      }

      toast.success(`Order ${data.order.orderId} created for ${stockName}`)
      router.push("/orders")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to place order"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const isBuy = orderType === "buy"
  const color = COLORS[orderType]

  return (
    <Card className="overflow-hidden shadow-sm flex flex-col" style={{ borderColor: "hsl(var(--border) / 0.6)", height: "100%" }}>
      {/* Colored accent bar */}
      <div
        style={{
          height: 3,
          width: "100%",
          backgroundColor: color.accent,
          transition: "background-color 0.25s ease",
        }}
      />

      <CardHeader className="pb-3 pt-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold tracking-tight">
            Place Order
          </CardTitle>
          <span
            className="rounded-md px-2.5 py-1 text-xs font-mono font-medium"
            style={{
              backgroundColor: color.accentLight,
              color: color.accent,
              transition: "background-color 0.25s ease, color 0.25s ease",
            }}
          >
            {stockName}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mt-1">
          {isMarketOrder ? "Market order · executes instantly at current price" : "Limit order · checked every 30s until execution or market close"}
        </p>
      </CardHeader>

      <CardContent className="pb-5 flex-1 flex flex-col">
        <form className="space-y-5 flex-1 flex flex-col" onSubmit={handleSubmit}>

          {/* Buy / Sell toggle */}
          <div
            className="flex rounded-lg p-0.5 gap-0.5"
            style={{
              backgroundColor: "hsl(var(--muted) / 0.5)",
              border: "1px solid hsl(var(--border) / 0.5)",
            }}
          >
            {(["buy", "sell"] as const).map((type) => {
              const isActive = orderType === type
              const c = COLORS[type]
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOrderType(type)}
                  onMouseEnter={() => setHoveredType(type)}
                  onMouseLeave={() => setHoveredType(null)}
                  className="flex-1 py-2 text-sm font-medium rounded-md capitalize"
                  style={{
                    transition: "background-color 0.2s ease, color 0.2s ease",
                    backgroundColor: isActive
                      ? c.accent
                      : hoveredType === type
                      ? "hsl(var(--muted))"
                      : "transparent",
                    color: isActive
                      ? "#ffffff"
                      : "hsl(var(--muted-foreground))",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              )
            })}
          </div>

          {/* Quantity + Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: "hsl(var(--muted-foreground))" }}
                htmlFor="quantity"
              >
                Quantity
              </label>
              <Input
                id="quantity"
                min="1"
                step="1"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="h-10 font-mono text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: "hsl(var(--muted-foreground))" }}
                htmlFor="price"
              >
                Limit Price <span style={{ color: "hsl(var(--muted-foreground))", fontWeight: 400, textTransform: "none" }}>(optional)</span>
              </label>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none pointer-events-none"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  ₹
                </span>
                <Input
                  id="price"
                  min="0.01"
                  step="0.01"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={currentPrice ? `₹${currentPrice.toLocaleString("en-IN")} (market)` : "Market price"}
                  className="h-10 pl-7 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Estimated value row */}
          <div
            className="flex items-center justify-between rounded-lg px-4 py-3"
            style={{
              backgroundColor: "hsl(var(--muted) / 0.4)",
              border: "1px solid hsl(var(--border) / 0.4)",
            }}
          >
            <span
              className="text-xs font-medium"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              Estimated value
            </span>
            <span className="text-sm font-mono font-semibold tabular-nums">
              {estimatedValue > 0 ? (
                <>
                  <span
                    className="text-xs mr-1"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    ₹
                  </span>
                  {estimatedValue.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </>
              ) : (
                <span style={{ color: "hsl(var(--muted-foreground))" }}>—</span>
              )}
            </span>
          </div>

          {/* Submit button */}
          <div className="mt-auto pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 rounded-md text-sm font-medium text-white"
              style={{
                backgroundColor: isSubmitting ? color.accentHover : color.accent,
                transition: "background-color 0.2s ease",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.85 : 1,
                border: "none",
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = color.accentHover
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = color.accent
                }
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="inline-block h-3.5 w-3.5 rounded-full border-2 animate-spin"
                    style={{
                      borderColor: "rgba(255,255,255,0.3)",
                      borderTopColor: "#ffffff",
                    }}
                  />
                  Placing order…
                </span>
              ) : (
                `${isBuy ? "Buy" : "Sell"} ${stockName}`
              )}
            </button>
          </div>

        </form>
      </CardContent>
    </Card>
  )
}
