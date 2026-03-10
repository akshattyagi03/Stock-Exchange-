"use client"

import { useState } from "react"
import { Bot, TrendingUp, GitCompare, Send, Plus, X, Loader2, Sparkles, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

const AVAILABLE_SYMBOLS = ["INFY", "TCS", "HDFCBANK", "RELIANCE"]

type Message = {
    role: "user" | "assistant"
    content: string
}

/* ── Analyze Tab ─────────────────────────────────────────── */

function AnalyzeTab() {
    const [symbol, setSymbol] = useState("TCS")
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [started, setStarted] = useState(false)

    const QUICK_PROMPTS = [
        "What's the overall outlook for this stock?",
        "Identify key support and resistance levels",
        "Is this a good time to buy?",
        "Summarise recent price action",
    ]

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
                body: JSON.stringify({ symbol, messages: next }),
            })

            if (!res.body) throw new Error("No stream")

            const reader = res.body.getReader()
            const decoder = new TextDecoder()
            let assistant = ""

            // Add empty assistant message to stream into
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
                <CardContent className="space-y-2">
                    {AVAILABLE_SYMBOLS.map((s) => (
                        <button
                            key={s}
                            onClick={() => { setSymbol(s); setMessages([]); setStarted(false) }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${symbol === s
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {s}
                            {symbol === s && <ChevronRight className="size-3.5" />}
                        </button>
                    ))}
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
                                    <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-br-sm"
                                        : "bg-muted text-foreground rounded-bl-sm"
                                        }`}>
                                        {m.content}
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

/* ── Compare Tab ─────────────────────────────────────────── */

function CompareTab() {
    const [selected, setSelected] = useState<string[]>(["TCS", "INFY"])
    const [result, setResult] = useState("")
    const [loading, setLoading] = useState(false)

    function toggle(s: string) {
        setSelected((prev) =>
            prev.includes(s)
                ? prev.filter((x) => x !== s)
                : prev.length < 4 ? [...prev, s] : prev
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
                body: JSON.stringify({ symbols: selected }),
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

            {/* Stock selector */}
            <Card className="border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Select Stocks to Compare</CardTitle>
                    <CardDescription className="text-xs">Choose 2–4 stocks</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {AVAILABLE_SYMBOLS.map((s) => {
                            const active = selected.includes(s)
                            return (
                                <button
                                    key={s}
                                    onClick={() => toggle(s)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${active
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                                        }`}
                                >
                                    {active
                                        ? <X className="size-3" />
                                        : <Plus className="size-3" />}
                                    {s}
                                </button>
                            )
                        })}
                    </div>

                    {/* Selected pills */}
                    {selected.length > 0 && (
                        <>
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
                                <Button
                                    size="sm"
                                    onClick={compare}
                                    disabled={selected.length < 2 || loading}
                                    className="gap-1.5"
                                >
                                    {loading ? <Loader2 className="size-3.5 animate-spin" /> : <GitCompare className="size-3.5" />}
                                    Compare
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Result */}
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
                            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{result}</p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Empty state */}
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

/* ── Page ────────────────────────────────────────────────── */

export default function AdvisorPage() {
    return (
        <div className="min-h-screen bg-background p-6 space-y-6">

            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Bot className="size-4 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">AI Advisor</h1>
                    </div>
                    <p className="text-muted-foreground text-sm pl-10">
                        Analyse stocks and compare performance with AI
                    </p>
                </div>
                <Badge variant="outline" className="gap-1.5 text-xs mt-1">
                    <Sparkles className="size-3" />
                    Powered by Gemini
                </Badge>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="analyze">
                <TabsList className="h-9">
                    <TabsTrigger value="analyze" className="gap-1.5 text-xs">
                        <TrendingUp className="size-3.5" />
                        Analyse
                    </TabsTrigger>
                    <TabsTrigger value="compare" className="gap-1.5 text-xs">
                        <GitCompare className="size-3.5" />
                        Compare
                    </TabsTrigger>
                </TabsList>

                <div className="mt-4">
                    <TabsContent value="analyze">
                        <AnalyzeTab />
                    </TabsContent>
                    <TabsContent value="compare">
                        <CompareTab />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}