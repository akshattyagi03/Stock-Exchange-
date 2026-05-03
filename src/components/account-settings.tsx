"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface Settings {
    name: string
    email: string
    authProvider: "credentials" | "google"
}

interface AccountSettingsProps {
    settings: Settings
    onUpdate: () => void
}

export function AccountSettings({ settings, onUpdate }: AccountSettingsProps) {
    const [name, setName] = useState(settings.name)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [savingAccount, setSavingAccount] = useState(false)

    async function handleAccountSave(e: React.FormEvent) {
        e.preventDefault()
        if (password && password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        setSavingAccount(true)
        try {
            const body: any = {}
            if (name !== settings.name) body.name = name
            if (password) body.password = password

            if (Object.keys(body).length === 0) {
                toast.info("No changes to save")
                return
            }

            const res = await fetch("/api/settings/account", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || "Failed to update account"); return }

            toast.success("Account updated successfully")
            setPassword("")
            setConfirmPassword("")
            onUpdate()
        } catch {
            toast.error("Failed to update account")
        } finally {
            setSavingAccount(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Update your name and password</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAccountSave} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                    </div>

                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={settings.email} disabled className="opacity-60" />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    {settings.authProvider === "credentials" && (
                        <>
                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Leave blank to keep current"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Confirm Password</Label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </>
                    )}

                    {settings.authProvider === "google" && (
                        <p className="text-xs text-muted-foreground">Password change is not available for Google accounts</p>
                    )}

                    <Button type="submit" disabled={savingAccount}>
                        {savingAccount && <Loader2 className="size-4 animate-spin mr-2" />}
                        Save Account
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
