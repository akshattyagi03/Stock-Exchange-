import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { AuthOptions } from "@/app/api/auth/[...nextauth]/options"
import dbConnect from "@/lib/dbConnect"
import { getCurrentStockQuote } from "@/lib/stock-quotes"
import HoldingModel from "@/models/Holdings"

const COLORS = ["#10b981", "#6c63ff", "#38bdf8", "#a3e635", "#f59e0b", "#8b5cf6"]

export async function GET() {
  try {
    await dbConnect()

    const session = await getServerSession(AuthOptions)

    if (!session?.user?._id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const holdings = await HoldingModel.find({
      user: session.user._id,
    }).lean()

    let totalPortfolioValue = 0
    let totalInvested = 0
    let overallPnL = 0
    let todaysPnL = 0

    const enrichedHoldings = []

    for (const holding of holdings) {
      const symbol = holding.stockName.toUpperCase()
      const quantity =
        (holding.availableQuantity ?? 0) + (holding.frozenQuantity ?? 0)

      if (quantity <= 0) continue

      const averageBuyPrice = holding.averageBuyPrice ?? 0
      const quote = await getCurrentStockQuote(symbol)
      const currentPrice = quote?.price ?? averageBuyPrice
      const previousClose = quote?.previousClose ?? currentPrice
      const invested = averageBuyPrice * quantity
      const currentValue = currentPrice * quantity
      const holdingOverallPnL = currentValue - invested
      const holdingTodaysPnL = (currentPrice - previousClose) * quantity

      totalPortfolioValue += currentValue
      totalInvested += invested
      overallPnL += holdingOverallPnL
      todaysPnL += holdingTodaysPnL

      enrichedHoldings.push({
        symbol,
        name: symbol,
        category: "Equity",
        quantity,
        averageBuyPrice,
        currentPrice,
        invested,
        currentValue,
        overallPnL: holdingOverallPnL,
        todaysPnL: holdingTodaysPnL,
      })
    }

    const allocationTotal = totalPortfolioValue || totalInvested
    const companyAllocation = enrichedHoldings.map((holding, index) => ({
      name: holding.symbol,
      percentage:
        allocationTotal > 0
          ? Number(((holding.currentValue / allocationTotal) * 100).toFixed(2))
          : 0,
      color: COLORS[index % COLORS.length],
    }))

    const categories = [
      {
        name: "Equity",
        funds: enrichedHoldings.length,
        percentage: allocationTotal > 0 ? 100 : 0,
        color: "#10b981",
      },
    ]

    const chartData = [
      {
        date: "Invested",
        value: totalInvested,
        invested: totalInvested,
      },
      {
        date: "Current",
        value: totalPortfolioValue,
        invested: totalInvested,
      },
    ]

    return NextResponse.json({
      summary: {
        totalPortfolioValue,
        totalInvested,
        overallPnL,
        todaysPnL,
      },
      holdings: enrichedHoldings,
      chartData,
      categoryDistribution: categories,
      equityAllocation: {
        Sectors: [
          {
            name: "Unclassified",
            percentage: allocationTotal > 0 ? 100 : 0,
            color: "#4b5563",
          },
        ],
        "Market Cap": [
          {
            name: "Unclassified",
            percentage: allocationTotal > 0 ? 100 : 0,
            color: "#4b5563",
          },
        ],
        Companies: companyAllocation,
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: "Failed to calculate portfolio analytics" },
      { status: 500 }
    )
  }
}
