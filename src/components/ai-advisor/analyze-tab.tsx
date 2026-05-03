"use client"

import React, { useState } from "react"
import { Bot, Send, Loader2, Sparkles, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type Level, LEVELS } from "./level-selector"
import { MarkdownText } from "./markdown-text"

type Message = { role: "user" | "assistant"; content: string }

const QUICK_PROMPTS = [
  "What's the overall outlook for this stock?",
  "Identify key support and resistance levels",
  "Is this a good time to buy?",
  "Summarise recent price action",
]

export function AnalyzeTab({ level }: { level: Level }) {
  const [symbol, setSymbol] = useState("TCS")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)

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

  async function send(text: string) {
    if (!text.trim()) return
    const userMsg: Message = { role: "user", content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput("")
    setLoading(true)
    setStarted(true)

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, messages: next, level }),
      })

      if (!res.body) throw new Error("No stream")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistant = ""

      setMessages([...next, { role: "assistant", content: "" }])
      setLoading(false)

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistant += decoder.decode(value, { stream: true })
        setMessages([...next, { role: "assistant", content: assistant }])
      }
    } catch {
      setMessages([...next, { role: "assistant", content: "Something went wrong. Please try again." }])
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 h-full">

      {/* Left — stock picker */}
      <Card className="border-border/50 h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative" ref={searchRef}>
            <Input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowDropdown(true) }}
              onFocus={() => { if (searchQuery.trim()) setShowDropdown(true) }}
              placeholder="Search stock..."
              className="text-sm h-8"
            />
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-card border rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto">
                {searchResults.map(item => (
                  <button
                    key={item.instrument_key}
                    className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      setSymbol(item.trading_symbol)
                      setMessages([])
                      setStarted(false)
                      setSearchQuery(item.trading_symbol)
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

          {symbol && (
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-primary/10 text-primary text-sm font-semibold">
              {symbol}
              <ChevronRight className="size-3.5" />
            </div>
          )}

          <div className="rounded-lg px-3 py-2.5" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs text-muted-foreground mb-0.5">Response style</p>
            <p className="text-xs font-medium capitalize">{LEVELS.find(l => l.id === level)?.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{LEVELS.find(l => l.id === level)?.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Right — chat */}
      <Card className="border-border/50 flex flex-col min-h-140">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="size-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm">Analysing {symbol}</CardTitle>
                <CardDescription className="text-xs">AI-powered stock analysis</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-xs gap-1">
              <span className="size-1.5 rounded-full bg-green-500 inline-block" />
              Ready
            </Badge>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1 p-4">
          {!started ? (
            <div className="h-full flex flex-col items-center justify-center py-12 gap-6">
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">Ask anything about {symbol}</p>
                <p className="text-xs text-muted-foreground">Or pick a prompt below to get started</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="text-left text-xs px-3 py-2.5 rounded-lg border border-border/60 hover:bg-muted hover:border-border transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="size-3.5 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                    }`}>
                    {m.role === "assistant" ? <MarkdownText text={m.content} /> : m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="size-3.5 text-primary" />
                  </div>
                  <div className="bg-muted rounded-xl rounded-bl-sm px-4 py-3">
                    <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t border-border/50">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
              placeholder={`Ask about ${symbol}…`}
              className="text-sm"
              disabled={loading}
            />
            <Button size="icon" onClick={() => send(input)} disabled={loading || !input.trim()}>
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
