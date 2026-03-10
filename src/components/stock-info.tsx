"use client"

import { useEffect, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface Props {
  symbol: string
}

export default function StockInfo({ symbol }: Props) {
  const [data, setData] = useState<any>(null)
  const [company, setCompany] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/stocks/${symbol}/info`)
      const json = await res.json()
      setData(json)
    }

    async function fetchCompany() {
      const res = await fetch(`/api/stocks/${symbol}/company`)
      const json = await res.json()
      setCompany(json)
    }

    fetchData()
    fetchCompany()
  }, [symbol])

  if (!data || !company) return <div>Loading...</div>

  return (
    <div className="space-y-6">

      {/* PRICE METRICS */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Price</CardTitle>
          </CardHeader>
          <CardContent>₹{data.price}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Open</CardTitle>
          </CardHeader>
          <CardContent>₹{data.open}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">High</CardTitle>
          </CardHeader>
          <CardContent>₹{data.high}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Low</CardTitle>
          </CardHeader>
          <CardContent>₹{data.low}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Volume</CardTitle>
          </CardHeader>
          <CardContent>{data.volume}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Change</CardTitle>
          </CardHeader>
          <CardContent
            className={data.change > 0 ? "text-green-500" : "text-red-500"}
          >
            {data.change} ({data.changePercent}%)
          </CardContent>
        </Card>

      </div>

      {/* COMPANY TABS */}

      <Tabs defaultValue="overview">

        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}

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

        {/* FUNDAMENTALS */}

        <TabsContent value="fundamentals">
          <Card>
            <CardHeader>
              <CardTitle>Fundamentals</CardTitle>
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-4">

              <div>
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="font-semibold">
                  ₹{(company.marketCap / 1e12).toFixed(2)} T
                </p>
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

        {/* ABOUT */}

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

    </div>
  )
}