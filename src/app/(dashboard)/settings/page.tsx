"use client"

import React from "react"
import { useEffect, useState } from "react"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import { AccountSettings } from "@/components/account-settings"
import { TradingPreferences } from "@/components/trading-preferences"
import { HoldingsReport } from "@/components/holdings-report"

interface Settings {
  name: string
  email: string
  authProvider: "credentials" | "google"
  defaultOrderType: "market" | "limit"
  defaultQuantity: number
  defaultExchange: "NSE" | "BSE"
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings")
      const data = await res.json()
      if (!data.error) setSettings(data)
    } catch (err) {
      console.error("Failed to fetch settings:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!settings) return null

  return (
    <div className="p-6" style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and trading preferences</p>
      </div>

      <Separator />

      {/* Top row — side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "stretch" }}>
        <AccountSettings settings={settings} onUpdate={fetchSettings} />
        <TradingPreferences
          defaultOrderType={settings.defaultOrderType ?? "market"}
          defaultQuantity={settings.defaultQuantity ?? 1}
          defaultExchange={settings.defaultExchange ?? "NSE"}
        />
      </div>

      {/* Bottom — full width */}
      <HoldingsReport />

    </div>
  )
}