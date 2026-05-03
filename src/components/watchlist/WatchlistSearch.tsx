"use client"

import { useEffect, useRef, useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SearchResult {
  trading_symbol: string
  name: string
  instrument_key: string
}

interface Props {
  onAddStock: (instrument: { trading_symbol: string; instrument_key: string }) => void
}

export default function WatchlistSearch({ onAddStock }: Props) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative w-full max-w-md mx-4" ref={searchRef}>
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value.trim()) setShowDropdown(true) }}
        onFocus={() => { if (searchQuery.trim()) setShowDropdown(true) }}
        placeholder="Search markets to add..."
        className="w-full pl-11 pr-4 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
      />
      {showDropdown && searchResults.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-card border rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
          {searchResults.map((item) => (
            <div
              key={item.instrument_key}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold">{item.trading_symbol}</p>
                <p className="text-xs text-muted-foreground">{item.name}</p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="h-7 text-xs"
                onClick={() => {
                  onAddStock(item)
                  setShowDropdown(false)
                  setSearchQuery("")
                }}
              >
                Add
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
