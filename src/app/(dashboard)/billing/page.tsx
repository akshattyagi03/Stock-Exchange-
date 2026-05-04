"use client"

import { useState, useEffect } from "react"
import {
  CreditCard,
  Sparkles,
  Check,
  X,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Crown,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import Script from "next/script"

/* ── Types & mock data ───────────────────────────────────── */

type UserTier = "standard" | "premium"
type SubscriptionStatus = "active" | "cancelled" | "past_due"

/* ── Feature lists ───────────────────────────────────────── */

const FREE_FEATURES = [
  "Basic trading simulation",
  "Portfolio tracking",
  "Market data (15-min delay)",
  "Limited AI usage (5/day)",
]

const FREE_MISSING = [
  "AI Portfolio Analysis",
  "Advanced Analytics",
  "Priority AI responses",
]

const PREMIUM_FEATURES = [
  "Everything in Free",
  "AI Portfolio Analysis",
  "Smart Trade Insights",
  "Advanced Analytics dashboard",
  "Priority AI responses",
  "Real-time market data",
]

/* ── Status badge ────────────────────────────────────────── */

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const map = {
    active:    { label: "Active",    color: "#4ade80", bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.25)" },
    cancelled: { label: "Cancelled", color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)" },
    past_due:  { label: "Past Due",  color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.25)" },
  }
  const s = map[status]
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
        color: s.color, backgroundColor: s.bg, border: `1px solid ${s.border}`,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 99, backgroundColor: s.color, display: "inline-block" }} />
      {s.label}
    </span>
  )
}

/* ── Confirm dialog ──────────────────────────────────────── */

function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
    >
      <div
        style={{
          backgroundColor: "hsl(var(--card))", borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "32px 28px", maxWidth: 400, width: "100%",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertTriangle style={{ width: 18, height: 18, color: "#f87171" }} />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "hsl(var(--foreground))" }}>Cancel Subscription</p>
            <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginTop: 2 }}>This action cannot be undone</p>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", lineHeight: 1.6, marginBottom: 24 }}>
          You'll lose access to all Premium features at the end of your billing period. Your data will be retained.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
              backgroundColor: "transparent", color: "hsl(var(--foreground))", fontSize: 13, fontWeight: 500, cursor: "pointer",
            }}
          >
            Keep Plan
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "9px 0", borderRadius: 8, border: "none",
              backgroundColor: "#f87171", color: "#ffffff", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ───────────────────────────────────────────── */

export default function BillingPage() {
  const [upgrading, setUpgrading] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [tier, setTier] = useState<UserTier>("standard")
  const [status, setStatus] = useState<SubscriptionStatus>("active")
  const [loadingTier, setLoadingTier] = useState(true)

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        if (!data.error) setTier(data.tier ?? "standard")
      })
      .catch(() => {})
      .finally(() => setLoadingTier(false))
  }, [])

  const isPremium = tier === "premium"

  async function handleUpgrade() {
    setUpgrading(true)
    try {
      const res = await fetch("/api/billing/create-order", { method: "POST" })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to initiate payment")
        setUpgrading(false)
        return
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Stock-Ex",
        description: "Premium Plan — Monthly",
        order_id: data.orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/billing/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })

          const verifyData = await verifyRes.json()

          if (verifyData.success) {
            setTier("premium")
            setStatus("active")
            toast.success("Welcome to Premium! 🎉")
          } else {
            toast.error("Payment verification failed. Contact support.")
          }
        },
        prefill: {},
        theme: { color: "#a855f7" },
        modal: {
          ondismiss: () => setUpgrading(false),
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
      setUpgrading(false)
    } catch {
      toast.error("Something went wrong. Please try again.")
      setUpgrading(false)
    }
  }

  async function handleCancel() {
    setShowConfirm(false)
    setCancelling(true)
    try {
      await fetch("/api/settings/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: "standard" }),
      })
      setTier("standard")
      setStatus("active")
      toast.success("Subscription cancelled")
    } catch {
      toast.error("Failed to cancel subscription")
    } finally {
      setCancelling(false)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      <ConfirmDialog
        open={showConfirm}
        onConfirm={handleCancel}
        onCancel={() => setShowConfirm(false)}
      />

      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "hsl(var(--background))",
          padding: "40px 24px",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>

          {/* ── Header ── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(99,102,241,0.2))",
                  border: "1px solid rgba(168,85,247,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <CreditCard style={{ width: 16, height: 16, color: "#a855f7" }} />
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "hsl(var(--foreground))", letterSpacing: "-0.02em" }}>
                Billing & Subscription
              </h1>
            </div>
            <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", paddingLeft: 46 }}>
              Manage your plan and billing details
            </p>
          </div>

          {/* ── Current plan card ── */}
          <Card
            style={{
              border: isPremium
                ? "1px solid rgba(168,85,247,0.3)"
                : "1px solid rgba(255,255,255,0.07)",
              backgroundColor: "hsl(var(--card))",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Top accent */}
            <div
              style={{
                height: 3,
                background: isPremium
                  ? "linear-gradient(90deg, #a855f7, #6366f1, #3b82f6)"
                  : "hsl(var(--border))",
              }}
            />
            <CardHeader style={{ paddingBottom: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 44, height: 44, borderRadius: 12,
                      backgroundColor: isPremium ? "rgba(168,85,247,0.12)" : "rgba(255,255,255,0.05)",
                      border: isPremium ? "1px solid rgba(168,85,247,0.2)" : "1px solid rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {isPremium
                      ? <Crown style={{ width: 20, height: 20, color: "#a855f7" }} />
                      : <Zap style={{ width: 20, height: 20, color: "hsl(var(--muted-foreground))" }} />
                    }
                  </div>
                  <div>
                    <p style={{ fontSize: 17, fontWeight: 700, color: "hsl(var(--foreground))" }}>
                      {isPremium ? "Premium Plan" : "Free Plan"}
                    </p>
                    <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginTop: 2 }}>
                      {isPremium ? "Active Premium subscription" : "You are on the Standard Plan"}
                    </p>
                  </div>
                </div>
                <StatusBadge status={status} />
              </div>
            </CardHeader>
            <CardContent style={{ paddingTop: 20 }}>
              <Separator style={{ marginBottom: 20, opacity: 0.4 }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 28 }}>
                  <div>
                    <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Monthly Cost</p>
                    <p style={{ fontSize: 22, fontWeight: 800, color: "hsl(var(--foreground))", fontFamily: "monospace" }}>
                      {isPremium ? "₹299" : "₹0"}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>AI Usage</p>
                    <p style={{ fontSize: 22, fontWeight: 800, color: "hsl(var(--foreground))", fontFamily: "monospace" }}>
                      {isPremium ? "∞" : "5/day"}
                    </p>
                  </div>
                </div>
                {isPremium && (
                  <button
                    onClick={() => setShowConfirm(true)}
                    disabled={cancelling}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 16px", borderRadius: 8,
                      border: "1px solid rgba(248,113,113,0.3)",
                      backgroundColor: "rgba(248,113,113,0.08)",
                      color: "#f87171", fontSize: 12, fontWeight: 600,
                      cursor: cancelling ? "not-allowed" : "pointer",
                      opacity: cancelling ? 0.6 : 1,
                      transition: "all 0.15s ease",
                    }}
                  >
                    {cancelling ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="animate-spin" style={{ display: "inline-block", width: 12, height: 12, borderRadius: 99, border: "2px solid rgba(248,113,113,0.3)", borderTopColor: "#f87171" }} />
                        Cancelling…
                      </span>
                    ) : (
                      <><X style={{ width: 13, height: 13 }} /> Cancel Subscription</>
                    )}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Pricing cards ── */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "hsl(var(--muted-foreground))", marginBottom: 16 }}>
              Available Plans
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

              {/* Free plan */}
              <Card
                style={{
                  border: !isPremium ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.06)",
                  backgroundColor: "hsl(var(--card))",
                  position: "relative",
                  transition: "border-color 0.2s ease",
                }}
              >
                <CardContent style={{ padding: "24px" }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--foreground))" }}>Free</p>
                      {!isPremium && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, backgroundColor: "rgba(255,255,255,0.08)", color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Current
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 28, fontWeight: 800, color: "hsl(var(--foreground))", fontFamily: "monospace", letterSpacing: "-0.02em" }}>
                      ₹0
                      <span style={{ fontSize: 13, fontWeight: 400, color: "hsl(var(--muted-foreground))", marginLeft: 4 }}>/month</span>
                    </p>
                    <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginTop: 6 }}>
                      Great for getting started with simulated trading
                    </p>
                  </div>

                  <Separator style={{ marginBottom: 16, opacity: 0.3 }} />

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                    {FREE_FEATURES.map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Check style={{ width: 13, height: 13, color: "#4ade80", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "hsl(var(--foreground))" }}>{f}</span>
                      </div>
                    ))}
                    {FREE_MISSING.map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <X style={{ width: 13, height: 13, color: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", textDecoration: "line-through" }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    disabled={!isPremium}
                    style={{
                      width: "100%", padding: "9px 0", borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.1)",
                      backgroundColor: !isPremium ? "rgba(255,255,255,0.04)" : "transparent",
                      color: !isPremium ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))",
                      fontSize: 13, fontWeight: 600,
                      cursor: !isPremium ? "not-allowed" : "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {!isPremium ? "Current Plan" : "Downgrade to Free"}
                  </button>
                </CardContent>
              </Card>

              {/* Premium plan */}
              <Card
                style={{
                  border: isPremium ? "1px solid rgba(168,85,247,0.4)" : "1px solid rgba(168,85,247,0.2)",
                  backgroundColor: isPremium ? "rgba(168,85,247,0.05)" : "hsl(var(--card))",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: isPremium ? "0 0 40px rgba(168,85,247,0.08)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Glow effect */}
                <div
                  style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: "linear-gradient(90deg, #a855f7, #6366f1, #3b82f6)",
                  }}
                />

                <CardContent style={{ padding: "24px" }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--foreground))" }}>Premium</p>
                        <span
                          style={{
                            fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
                            background: "linear-gradient(135deg, #a855f7, #6366f1)",
                            color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.06em",
                          }}
                        >
                          Popular
                        </span>
                      </div>
                      {isPremium && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, backgroundColor: "rgba(168,85,247,0.15)", color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Current
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 28, fontWeight: 800, color: "hsl(var(--foreground))", fontFamily: "monospace", letterSpacing: "-0.02em" }}>
                      ₹299
                      <span style={{ fontSize: 13, fontWeight: 400, color: "hsl(var(--muted-foreground))", marginLeft: 4 }}>/month</span>
                    </p>
                    <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginTop: 6 }}>
                      Full AI-powered trading intelligence suite
                    </p>
                  </div>

                  <Separator style={{ marginBottom: 16, opacity: 0.3 }} />

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                    {PREMIUM_FEATURES.map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Check style={{ width: 13, height: 13, color: "#a855f7", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "hsl(var(--foreground))" }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={!isPremium ? handleUpgrade : undefined}
                    disabled={isPremium || upgrading}
                    style={{
                      width: "100%", padding: "9px 0", borderRadius: 8, border: "none",
                      background: isPremium
                        ? "rgba(168,85,247,0.12)"
                        : upgrading
                        ? "linear-gradient(135deg, rgba(168,85,247,0.6), rgba(99,102,241,0.6))"
                        : "linear-gradient(135deg, #a855f7, #6366f1)",
                      color: isPremium ? "#a855f7" : "#ffffff",
                      fontSize: 13, fontWeight: 600,
                      cursor: isPremium || upgrading ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                      transition: "opacity 0.15s ease",
                    }}
                    onMouseEnter={(e) => { if (!isPremium && !upgrading) (e.currentTarget as HTMLButtonElement).style.opacity = "0.88" }}
                    onMouseLeave={(e) => { if (!isPremium && !upgrading) (e.currentTarget as HTMLButtonElement).style.opacity = "1" }}
                  >
                    {isPremium ? (
                      <><ShieldCheck style={{ width: 14, height: 14 }} /> Current Plan</>
                    ) : upgrading ? (
                      <><span className="animate-spin" style={{ display: "inline-block", width: 13, height: 13, borderRadius: 99, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }} /> Processing…</>
                    ) : (
                      <><Sparkles style={{ width: 14, height: 14 }} /> Upgrade to Premium</>
                    )}
                  </button>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* ── Info footer ── */}
          <div
            style={{
              padding: "16px 20px",
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            <ShieldCheck style={{ width: 15, height: 15, color: "hsl(var(--muted-foreground))", flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", lineHeight: 1.5 }}>
              Payments are securely processed via Razorpay. Subscriptions auto-renew monthly and can be cancelled anytime. No hidden charges.
            </p>
          </div>

        </div>
      </div>
    </>
  )
}