"use client"

import React, { useState } from "react"
import { GitCompare, X, Loader2, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { type Level } from "./level-selector"
import { MarkdownText } from "./markdown-text"

export function CompareTab({ level }: { level: Level }) {
  const [selected, setSelected] = useState<string[]>(["TCS", "INFY"])
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{ trading_symbol: string; name: string; instrument_key: string }[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        const data = await res.json()
        setSearchResults(data.results || [])
        setShowDropdown(true)
      } catch { setSearchResults([]) }
    }, 250)
    return () => clearTimeout(t)
  }, [searchQuery])

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDropdown(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function toggle(s: string) {
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : prev.length < 4 ? [...prev, s] : prev
    )
    setResult("")
  }

  async function compare() {
    if (selected.length < 2) return
    setLoading(true)
    setResult("")

    try {
      const res = await fetch("/api/ai/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols: selected, level }),
      })

      if (!res.body) throw new Error("No stream")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let output = ""
      setLoading(false)

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        output += decoder.decode(value, { stream: true })
        setResult(output)
      }
    } catch {
      setResult("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Select Stocks to Compare</CardTitle>
          <CardDescription className="text-xs">Choose 2–4 stocks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4" ref={searchRef}>
            <Input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowDropdown(true) }}
              onFocus={() => { if (searchQuery.trim()) setShowDropdown(true) }}
              placeholder="Search and add stocks..."
              className="text-sm h-8"
              disabled={selected.length >= 4}
            />
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-card border rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto">
                {searchResults.map(item => (
                  <button
                    key={item.instrument_key}
                    className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      toggle(item.trading_symbol)
                      setSearchQuery("")
                      setShowDropdown(false)
                    }}
                  >
                    <p className="text-sm font-semibold">{item.trading_symbol}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selected.length > 0 && (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {selected.map(s => (
                  <button
                    key={s}
                    onClick={() => toggle(s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border bg-primary text-primary-foreground border-primary"
                  >
                    <X className="size-3" />
                    {s}
                  </button>
                ))}
              </div>
              <Separator className="mb-4" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Comparing:</span>
                  {selected.map((s, i) => (
                    <span key={s} className="flex items-center gap-1 text-xs font-semibold">
                      {s}
                      {i < selected.length - 1 && <span className="text-muted-foreground">vs</span>}
                    </span>
                  ))}
                </div>
                <Button size="sm" onClick={compare} disabled={selected.length < 2 || loading} className="gap-1.5">
                  {loading ? <Loader2 className="size-3.5 animate-spin" /> : <GitCompare className="size-3.5" />}
                  Compare
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {(result || loading) && (
        <Card className="border-border/50">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="size-3.5 text-primary" />
              </div>
              <CardTitle className="text-sm">Comparison Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="flex items-center gap-3 py-6 justify-center text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                <span className="text-sm">Analysing {selected.join(", ")}…</span>
              </div>
            ) : (
              <div className="text-sm text-foreground">
                <MarkdownText text={result} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!result && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
            <GitCompare className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Select stocks and hit Compare</p>
          <p className="text-xs text-muted-foreground">The AI will give you a side-by-side breakdown</p>
        </div>
      )}
    </div>
  )
}
