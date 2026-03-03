import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { AuthOptions } from "@/app/api/auth/[...nextauth]/options"
import OrderModel from "@/models/Orders"
import dbConnect from "@/lib/dbConnect"
import { redis, connectRedis } from "@/lib/redis"

export async function GET() {
  try {
    await dbConnect()
    await connectRedis()

    const session = await getServerSession(AuthOptions)

    if (!session?.user?._id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user._id

    const orders = await OrderModel.find({
      user: userId,
      status: "executed",
    })

    const holdingsMap: Record<
      string,
      { quantity: number; totalCost: number }
    > = {}

    for (const order of orders) {
      if (!holdingsMap[order.stockName]) {
        holdingsMap[order.stockName] = {
          quantity: 0,
          totalCost: 0,
        }
      }

      if (order.orderType === "buy") {
        holdingsMap[order.stockName].quantity += order.executedQuantity
        holdingsMap[order.stockName].totalCost +=
          order.executedPrice! * order.executedQuantity
      }

      if (order.orderType === "sell") {
        holdingsMap[order.stockName].quantity -= order.executedQuantity
      }
    }

    let totalPortfolioValue = 0
    let totalInvested = 0
    let overallPnL = 0
    let todaysPnL = 0

    for (const stock in holdingsMap) {
      const { quantity, totalCost } = holdingsMap[stock]

      if (quantity <= 0) continue

      const cached = await redis.get(`stock:${stock}`)
      if (!cached) continue

      const { lastPrice, prevClose } = JSON.parse(cached)

      const averagePrice = totalCost / quantity
      const currentValue = lastPrice * quantity
      const invested = averagePrice * quantity
      const stockOverallPnL = currentValue - invested
      const stockTodayPnL = (lastPrice - prevClose) * quantity

      totalPortfolioValue += currentValue
      totalInvested += invested
      overallPnL += stockOverallPnL
      todaysPnL += stockTodayPnL
    }

    return NextResponse.json({
      totalPortfolioValue,
      totalInvested,
      overallPnL,
      todaysPnL,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: "Failed to calculate summary" },
      { status: 500 }
    )
  }
}