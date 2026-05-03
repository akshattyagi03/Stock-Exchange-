"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, Download } from "lucide-react"

export function HoldingsReport() {
    const [downloadingPdf, setDownloadingPdf] = useState(false)

    async function handleDownloadHoldings() {
        setDownloadingPdf(true)
        try {
            const res = await fetch("/api/holdings", { method: "POST" })
            if (!res.ok) {
                toast.error("Failed to generate holdings report")
                return
            }
            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `holdings-${Date.now()}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            toast.success("Holdings report downloaded successfully")
        } catch {
            toast.error("Failed to download holdings report")
        } finally {
            setDownloadingPdf(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Holdings Report</CardTitle>
                <CardDescription>Download a detailed report of all your current holdings</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleDownloadHoldings} disabled={downloadingPdf} variant="outline">
                    {downloadingPdf ? (
                        <Loader2 className="size-4 animate-spin mr-2" />
                    ) : (
                        <Download className="size-4 mr-2" />
                    )}
                    Download Holdings Report (PDF)
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                    Downloads a PDF file with all your current holdings
                </p>
            </CardContent>
        </Card>
    )
}
