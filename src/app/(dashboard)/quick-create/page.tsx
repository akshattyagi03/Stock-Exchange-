"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Zap, TrendingUp, TrendingDown } from "lucide-react"
import OrderTicket from "@/components/order-ticket"

interface SearchResult {
  trading_symbol: string
  name: string
  instrument_key: string
}

interface StockInfo {
  price: number
  change: number
  changePercent: number
}

export default function QuickOrderPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedStock, setSelectedStock] = useState<SearchResult | null>(null)
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null)
  const [loadingInfo, setLoadingInfo] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Search debounce
  useEffect(() => {
    if (!query.trim()) { setResults([]); setShowDropdown(false); return }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.results || [])
        setShowDropdown(true)
      } catch { setResults([]) }
    }, 250)
    return () => clearTimeout(t)
  }, [query])

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

  // Fetch price info when stock selected
  useEffect(() => {
    if (!selectedStock) return
    setLoadingInfo(true)
    setStockInfo(null)
    fetch(`/api/stocks/${selectedStock.trading_symbol}/info`)
      .then(r => r.json())
      .then(data => setStockInfo(data))
      .catch(() => setStockInfo(null))
      .finally(() => setLoadingInfo(false))
  }, [selectedStock])

  function selectStock(result: SearchResult) {
    setSelectedStock(result)
    setQuery(result.trading_symbol)
    setShowDropdown(false)
  }

  const isPositive = (stockInfo?.change ?? 0) >= 0

  return (
    <div className="min-h-screen bg-background p-6">
      <div
        style={{
          maxWidth: "560px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >

        {/* Header */}
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: "rgba(var(--primary), 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              className="bg-primary/10"
            >
              <Zap className="size-4 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Quick Order</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-10">
            Search a stock and place a limit order instantly
          </p>
        </div>

        {/* Search */}
        <div ref={searchRef} style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              borderRadius: "12px",
              border: "1px solid hsl(var(--border))",
              backgroundColor: "hsl(var(--card))",
              transition: "border-color 0.15s ease",
            }}
            onFocusCapture={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(var(--primary))"
            }}
            onBlurCapture={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(var(--border))"
            }}
          >
            <Search className="size-4 shrink-0" style={{ color: "hsl(var(--muted-foreground))" }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setShowDropdown(true) }}
              onFocus={() => { if (query.trim() && results.length) setShowDropdown(true) }}
              placeholder="Search by name or symbol — e.g. INFY, Tata..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: "14px",
                color: "hsl(var(--foreground))",
              }}
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setSelectedStock(null); setStockInfo(null); inputRef.current?.focus() }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "hsl(var(--muted-foreground))",
                  fontSize: "18px",
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* Dropdown */}
          {showDropdown && results.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                right: 0,
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                zIndex: 50,
                overflow: "hidden",
                maxHeight: "260px",
                overflowY: "auto",
              }}
            >
              {results.map((item, i) => (
                <button
                  key={item.instrument_key}
                  onClick={() => selectStock(item)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 14px",
                    background: "none",
                    border: "none",
                    borderBottom: i < results.length - 1 ? "1px solid hsl(var(--border) / 0.4)" : "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    transition: "background-color 0.1s ease",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "hsl(var(--muted) / 0.5)"}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"}
                >
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "hsl(var(--foreground))", fontFamily: "monospace" }}>
                      {item.trading_symbol}
                    </p>
                    <p style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", marginTop: 1 }}>
                      {item.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {showDropdown && query.trim() && results.length === 0 && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                right: 0,
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "center",
                zIndex: 50,
              }}
            >
              <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))" }}>No results for "{query}"</p>
            </div>
          )}
        </div>

        {/* Selected stock info strip */}
        {selectedStock && (
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "12px",
              border: "1px solid hsl(var(--border) / 0.5)",
              backgroundColor: "hsl(var(--card))",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, fontFamily: "monospace", color: "hsl(var(--foreground))" }}>
                {selectedStock.trading_symbol}
              </p>
              <p style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", marginTop: 2 }}>
                {selectedStock.name}
              </p>
            </div>

            {loadingInfo && (
              <p style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }}>Loading…</p>
            )}

            {stockInfo && !loadingInfo && (
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "15px", fontWeight: 700, fontFamily: "monospace", color: "hsl(var(--foreground))" }}>
                  ₹{stockInfo.price.toLocaleString("en-IN")}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", marginTop: 2 }}>
                  {isPositive
                    ? <TrendingUp style={{ width: 11, height: 11, color: "#4ade80" }} />
                    : <TrendingDown style={{ width: 11, height: 11, color: "#f87171" }} />
                  }
                  <p style={{
                    fontSize: "12px",
                    fontFamily: "monospace",
                    fontWeight: 500,
                    color: isPositive ? "#4ade80" : "#f87171",
                  }}>
                    {isPositive ? "+" : ""}{stockInfo.change} ({isPositive ? "+" : ""}{stockInfo.changePercent}%)
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Order ticket or empty state */}
        {selectedStock ? (
          <OrderTicket stockName={selectedStock.trading_symbol} defaultPrice={stockInfo?.price} />
        ) : (
          <div
            style={{
              padding: "48px 24px",
              borderRadius: "16px",
              border: "1px dashed hsl(var(--border))",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: "hsl(var(--muted))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Search style={{ width: 20, height: 20, color: "hsl(var(--muted-foreground))" }} />
            </div>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "hsl(var(--foreground))" }}>
              Search for a stock to get started
            </p>
            <p style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }}>
              Type a symbol or company name above
            </p>
          </div>
        )}

      </div>
    </div>
  )
}