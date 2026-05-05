import mongoose from "mongoose"

import { getStockPrice } from "@/lib/fmp"
import HoldingModel from "@/models/Holdings"
import OrderModel, { type IOrder } from "@/models/Orders"
import UserModel from "@/models/User"
import { sendTradeExecutedEmail } from "@/helpers/sendTradeExecutedEmail"

export interface OrderJobData {
  orderId: string
  stockName: string
  orderType: "buy" | "sell"
  price: number
  quantity: number
  userId: string
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

function getIstDate(date = new Date()) {
  return new Date(date.getTime() + IST_OFFSET_MS)
}

export function isPastMarketClose(date = new Date()) {
  const istNow = getIstDate(date)
  const hours = istNow.getUTCHours()
  const minutes = istNow.getUTCMinutes()

  return hours > 15 || (hours === 15 && minutes >= 30)
}

export async function getSimulatedPrice(stockName: string, orderPrice: number) {
  const fmpPrice = await getStockPrice(stockName)
  if (fmpPrice !== null) {
    console.log(`[worker] FMP price for ${stockName}: Rs.${fmpPrice}`)
    return fmpPrice
  }

  const jitter = (Math.random() * 4 - 2) / 100
  const fallback = Number((orderPrice * (1 + jitter)).toFixed(2))
  console.log(
    `[worker] FMP unavailable for ${stockName}, using jitter price: Rs.${fallback}`
  )
  return fallback
}

export async function executeBuyOrder(
  order: IOrder,
  executedPrice: number,
  session: mongoose.ClientSession
) {
  const qty = order.remainingQuantity
  const frozenAmount = order.price * qty
  const actualCost = executedPrice * qty
  const refund = Number((frozenAmount - actualCost).toFixed(2))

  await UserModel.findByIdAndUpdate(
    order.user,
    {
      $inc: {
        frozenBalance: -frozenAmount,
        availableBalance: refund,
      },
    },
    { session }
  )

  const existingHolding = await HoldingModel.findOne(
    { user: order.user, stockName: order.stockName },
    null,
    { session }
  )

  if (existingHolding) {
    const existingQty = existingHolding.availableQuantity
    const existingAvg = existingHolding.averageBuyPrice
    const nextQty = existingQty + qty
    const newAvg = Number(
      ((existingAvg * existingQty + executedPrice * qty) / nextQty).toFixed(2)
    )

    await HoldingModel.findByIdAndUpdate(
      existingHolding._id,
      {
        $inc: { availableQuantity: qty },
        $set: { averageBuyPrice: newAvg },
      },
      { session }
    )

    return
  }

  await HoldingModel.create(
    [
      {
        user: order.user,
        stockName: order.stockName,
        availableQuantity: qty,
        frozenQuantity: 0,
        averageBuyPrice: executedPrice,
      },
    ],
    { session }
  )
}

export async function executeSellOrder(
  order: IOrder,
  executedPrice: number,
  session: mongoose.ClientSession
) {
  const qty = order.remainingQuantity
  const proceeds = Number((executedPrice * qty).toFixed(2))

  await HoldingModel.findOneAndUpdate(
    { user: order.user, stockName: order.stockName },
    { $inc: { frozenQuantity: -qty } },
    { session }
  )

  await UserModel.findByIdAndUpdate(
    order.user,
    { $inc: { availableBalance: proceeds } },
    { session }
  )
}

export async function cancelOrder(
  order: IOrder,
  session: mongoose.ClientSession
) {
  const remainingQty = order.remainingQuantity
  const frozenUnitPrice = order.price

  if (remainingQty <= 0 || order.status === "cancelled") {
    return
  }

  if (order.orderType === "buy") {
    const frozenAmount = Number((frozenUnitPrice * remainingQty).toFixed(2))
    await UserModel.findByIdAndUpdate(
      order.user,
      {
        $inc: {
          frozenBalance: -frozenAmount,
          availableBalance: frozenAmount,
        },
      },
      { session }
    )
  } else {
    await HoldingModel.findOneAndUpdate(
      { user: order.user, stockName: order.stockName },
      {
        $inc: {
          frozenQuantity: -remainingQty,
          availableQuantity: remainingQty,
        },
      },
      { session }
    )
  }

  await OrderModel.findByIdAndUpdate(
    order._id,
    {
      $set: {
        status: "cancelled",
        remainingQuantity: 0,
      },
    },
    { session }
  )
}

export async function processExecuteOrder(data: OrderJobData) {
  const { orderId, stockName, orderType, price } = data
  const order = await OrderModel.findOne({ orderId })

  if (!order) {
    console.log(`[worker] Order ${orderId} not found, skipping.`)
    return { status: "not_found" as const }
  }

  if (order.status === "executed" || order.status === "cancelled") {
    console.log(`[worker] Order ${orderId} already ${order.status}, skipping.`)
    return { status: "already_done" as const }
  }

  if (isPastMarketClose()) {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      await cancelOrder(order, session)
      await session.commitTransaction()
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }

    return { status: "cancelled_market_close" as const }
  }

  const marketPrice = await getSimulatedPrice(stockName, price)
  const priceMatches =
    orderType === "buy" ? marketPrice <= price : marketPrice >= price

  if (!priceMatches) {
    throw new Error(
      `[worker] Price not matched for ${orderId}: market=Rs.${marketPrice}, order=Rs.${price} (${orderType})`
    )
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    if (orderType === "buy") {
      await executeBuyOrder(order, marketPrice, session)
    } else {
      await executeSellOrder(order, marketPrice, session)
    }

    await OrderModel.findByIdAndUpdate(
      order._id,
      {
        $set: {
          status: "executed",
          executedPrice: marketPrice,
          executedAt: new Date(),
          executedQuantity: order.quantity,
          remainingQuantity: 0,
        },
      },
      { session }
    )

    await session.commitTransaction()

    // Send trade execution email (non-blocking)
    const user = await UserModel.findById(order.user).select("email name orderExecutionAlerts")
    if (user?.orderExecutionAlerts) {
      sendTradeExecutedEmail({
        email: user.email,
        name: user.name,
        orderId: order.orderId,
        stockName: order.stockName,
        orderType,
        quantity: order.quantity,
        executedPrice: marketPrice,
        executedAt: new Date(),
      })
    }

    return { status: "executed" as const, executedPrice: marketPrice }
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

export async function cancelAllExpiredOrders() {
  const orders = await OrderModel.find({
    status: { $in: ["pending", "partially_executed"] },
    remainingQuantity: { $gt: 0 },
  })

  let cancelledCount = 0

  for (const order of orders) {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      await cancelOrder(order, session)
      await session.commitTransaction()
      cancelledCount += 1
    } catch (error) {
      await session.abortTransaction()
      console.error(`[worker] Failed to cancel order ${order.orderId}:`, error)
    } finally {
      session.endSession()
    }
  }

  return { cancelledCount }
}
