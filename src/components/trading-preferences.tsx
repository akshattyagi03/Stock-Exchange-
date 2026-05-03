"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface TradingPreferencesProps {
    defaultOrderType: "market" | "limit"
    defaultQuantity: number
    defaultExchange: "NSE" | "BSE"
}

export function TradingPreferences({ defaultOrderType: initialOrderType, defaultQuantity: initialQuantity, defaultExchange: initialExchange }: TradingPreferencesProps) {
    const [defaultOrderType, setDefaultOrderType] = useState<"market" | "limit">(initialOrderType)
    const [defaultQuantity, setDefaultQuantity] = useState(initialQuantity)
    const [defaultExchange, setDefaultExchange] = useState<"NSE" | "BSE">(initialExchange)
    const [savingPrefs, setSavingPrefs] = useState(false)

    async function handlePrefsSave(e: React.FormEvent) {
        e.preventDefault()
        setSavingPrefs(true)
        try {
            const res = await fetch("/api/settings/trading-preferences", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ defaultOrderType, defaultQuantity, defaultExchange }),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || "Failed to update preferences"); return }
            toast.success("Trading preferences updated")
        } catch {
            toast.error("Failed to update preferences")
        } finally {
            setSavingPrefs(false)
        }
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Trading Preferences</CardTitle>
                <CardDescription>Set your default order settings</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                <form onSubmit={handlePrefsSave} className="flex flex-col flex-1 space-y-4">
                    <div className="space-y-2">
                        <Label>Default Order Type</Label>
                        <Select value={defaultOrderType} onValueChange={(v) => setDefaultOrderType(v as "market" | "limit")}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="market">Market</SelectItem>
                                <SelectItem value="limit">Limit</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Default Quantity</Label>
                        <Input
                            type="number"
                            min={1}
                            value={defaultQuantity}
                            onChange={e => setDefaultQuantity(Number(e.target.value))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Default Exchange</Label>
                        <Select value={defaultExchange} onValueChange={(v) => setDefaultExchange(v as "NSE" | "BSE")}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NSE">NSE</SelectItem>
                                <SelectItem value="BSE">BSE</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="mt-auto pt-2">
                        <Button type="submit" disabled={savingPrefs}>
                            {savingPrefs && <Loader2 className="size-4 animate-spin mr-2" />}
                            Save Preferences
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
