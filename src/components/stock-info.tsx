"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Props {
  symbol: string
}

export default function StockInfo({ symbol }: Props) {
  const [company, setCompany] = useState<any>(null)

  useEffect(() => {
    async function fetchCompany() {
      const res = await fetch(`/api/stocks/${symbol}/company`)
      const json = await res.json()
      setCompany(json)
    }
    fetchCompany()
  }, [symbol])

  if (!company) {
    return (
      <div
        className="rounded-xl p-6 animate-pulse"
        style={{ backgroundColor: "rgba(255,255,255,0.04)", height: 160 }}
      />
    )
  }

  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
        <TabsTrigger value="about">About</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>{company.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Sector:</strong> {company.sector}</p>
            <p><strong>Industry:</strong> {company.industry}</p>
            <p><strong>CEO:</strong> {company.ceo}</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="fundamentals">
        <Card>
          <CardHeader>
            <CardTitle>Fundamentals</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Market Cap</p>
              <p className="font-semibold">₹{(company.marketCap / 1e12).toFixed(2)} T</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sector</p>
              <p className="font-semibold">{company.sector}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Industry</p>
              <p className="font-semibold">{company.industry}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CEO</p>
              <p className="font-semibold">{company.ceo}</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="about">
        <Card>
          <CardHeader>
            <CardTitle>About Company</CardTitle>
          </CardHeader>
          <CardContent className="leading-relaxed">
            {company.description}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}