import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { AuthOptions } from "@/app/api/auth/[...nextauth]/options"
import dbConnect from "@/lib/dbConnect"
import { getCurrentStockQuote } from "@/lib/stock-quotes"
import HoldingModel from "@/models/Holdings"

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
    const allocation = []

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

      allocation.push({
        symbol,
        quantity,
        averageBuyPrice,
        currentPrice,
        invested,
        currentValue,
        overallPnL: holdingOverallPnL,
        todaysPnL: holdingTodaysPnL,
      })
    }

    return NextResponse.json({
      totalPortfolioValue,
      totalInvested,
      overallPnL,
      todaysPnL,
      allocation,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: "Failed to calculate summary" },
      { status: 500 }
    )
  }
}
