import { getServerSession } from "next-auth"
import mongoose from "mongoose"
import { NextResponse } from "next/server"

import { AuthOptions } from "@/app/api/auth/[...nextauth]/options"
import dbConnect from "@/lib/dbConnect"
import { orderExecutionQueue } from "@/lib/bullmq"
import HoldingModel from "@/models/Holdings"
import OrderModel, { type IOrder } from "@/models/Orders"
import UserModel from "@/models/User"
import { generateOrderId } from "@/utils/generateOrderId"
import { cancelOrder, executeBuyOrder, executeSellOrder } from "@/workers/orderEngine"
import { getStockPrice } from "@/lib/fmp"

const ORDER_RETRY_DELAY_MS = 30_000
const MAX_ORDER_RETRY_ATTEMPTS = 1_000

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Error creating order"
}

export async function POST(request: Request) {
  await dbConnect()

  const session = await getServerSession(AuthOptions)

  if (!session?.user?._id) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    )
  }

  const userId = new mongoose.Types.ObjectId(session.user._id)
  const mongoSession = await mongoose.startSession()
  mongoSession.startTransaction()
  let createdOrder: IOrder | null = null
  let transactionCommitted = false

  try {
    const payload = await request.json()
    const stockName = String(payload.stockName || "").trim().toUpperCase()
    const quantity = Number(payload.quantity)
    const orderType = payload.orderType
    const isMarketOrder = payload.isMarketOrder === true

    let price: number

    if (isMarketOrder) {
      const marketPrice = await getStockPrice(stockName)
      if (!marketPrice) {
        throw new Error("Could not fetch market price. Please try again.")
      }
      price = marketPrice
    } else {
      price = Number(payload.price)
    }

    if (!stockName || !quantity || !price || !orderType) {
      throw new Error("Missing required fields")
    }

    if (quantity <= 0 || price <= 0) {
      throw new Error("Invalid quantity or price")
    }

    if (!["buy", "sell"].includes(orderType)) {
      throw new Error("Invalid order type")
    }

    if (orderType === "buy") {
      const requiredAmount = quantity * price

      const updatedUser = await UserModel.findOneAndUpdate(
        {
          _id: userId,
          availableBalance: { $gte: requiredAmount },
        },
        {
          $inc: {
            availableBalance: -requiredAmount,
            frozenBalance: requiredAmount,
          },
        },
        {
          new: true,
          session: mongoSession,
        }
      )

      if (!updatedUser) {
        throw new Error("Insufficient balance")
      }
    }

    if (orderType === "sell") {
      const holding = await HoldingModel.findOneAndUpdate(
        {
          user: userId,
          stockName,
          availableQuantity: { $gte: quantity },
        },
        {
          $inc: {
            availableQuantity: -quantity,
            frozenQuantity: quantity,
          },
        },
        {
          new: true,
          session: mongoSession,
        }
      )

      if (!holding) {
        throw new Error("Insufficient shares to sell")
      }
    }

    const order = await OrderModel.create(
      [
        {
          orderId: generateOrderId(),
          stockName,
          quantity,
          remainingQuantity: quantity,
          executedQuantity: 0,
          price,
          orderType,
          status: "pending",
          user: userId,
        },
      ],
      { session: mongoSession }
    )
    createdOrder = order[0]

    if (!createdOrder) {
      throw new Error("Order creation failed")
    }

    await mongoSession.commitTransaction()
    transactionCommitted = true

    if (isMarketOrder) {
      const execSession = await mongoose.startSession()
      execSession.startTransaction()
      try {
        if (orderType === "buy") {
          await executeBuyOrder(createdOrder, price, execSession)
        } else {
          await executeSellOrder(createdOrder, price, execSession)
        }
        await OrderModel.findByIdAndUpdate(
          createdOrder._id,
          { $set: { status: "executed", executedPrice: price, executedAt: new Date(), executedQuantity: createdOrder!.quantity, remainingQuantity: 0 } },
          { session: execSession }
        )
        await execSession.commitTransaction()
      } catch (execError) {
        await execSession.abortTransaction()
        throw execError
      } finally {
        execSession.endSession()
      }
    } else {
      await orderExecutionQueue.add(
        "execute-order",
        {
          orderId: createdOrder.orderId,
          stockName: createdOrder.stockName,
          orderType,
          price,
          quantity,
          userId: userId.toString(),
        },
        {
          jobId: createdOrder.orderId,
          attempts: MAX_ORDER_RETRY_ATTEMPTS,
          backoff: { type: "fixed", delay: ORDER_RETRY_DELAY_MS },
          removeOnComplete: true,
          removeOnFail: false,
        }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        order: createdOrder,
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    if (!transactionCommitted) {
      await mongoSession.abortTransaction()
    } else if (createdOrder) {
      const rollbackSession = await mongoose.startSession()
      rollbackSession.startTransaction()

      try {
        const freshOrder = await OrderModel.findById(createdOrder._id)
        if (freshOrder) {
          await cancelOrder(freshOrder, rollbackSession)
        }
        await rollbackSession.commitTransaction()
      } catch (rollbackError) {
        await rollbackSession.abortTransaction()
        console.error("[create-order] Failed to rollback unqueued order:", rollbackError)
      } finally {
        rollbackSession.endSession()
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 400 }
    )
  } finally {
    mongoSession.endSession()
  }
}
