"use client"

import dynamic from "next/dynamic"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

const ChartAreaInteractive = dynamic(
  () =>
    import("@/components/chart-area-interactive").then(
      (mod) => mod.ChartAreaInteractive
    ),
  { ssr: false }
)

export default function Page() {
  const { data: session } = useSession()
  const [holdings, setHoldings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHoldings = async () => {
      if (!session?.user?._id) return

      try {
        const response = await fetch("/api/holdings")
        const data = await response.json()

        if (response.ok) {
          setHoldings(data.holdings)
        }
      } catch (error) {
        console.error("Error fetching holdings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHoldings()
  }, [session])

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <DataTable data={holdings} />
          </div>
        </div>
      </div>
    </>
  )
}