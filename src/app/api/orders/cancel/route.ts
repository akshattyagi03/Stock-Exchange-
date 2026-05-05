import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { AuthOptions } from "@/app/api/auth/[...nextauth]/options"
import dbConnect from "@/lib/dbConnect"
import OrderModel from "@/models/Orders"
import mongoose from "mongoose"
import { cancelOrder } from "@/workers/orderEngine"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(AuthOptions)
    if (!session?.user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId } = await req.json()
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 })

    await dbConnect()

    const order = await OrderModel.findOne({ orderId, user: session.user._id })

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    if (order.status === "executed" || order.status === "cancelled") {
      return NextResponse.json({ error: `Order is already ${order.status}` }, { status: 400 })
    }

    const mongoSession = await mongoose.startSession()
    mongoSession.startTransaction()

    try {
      await cancelOrder(order, mongoSession)
      await mongoSession.commitTransaction()
    } catch (err) {
      await mongoSession.abortTransaction()
      throw err
    } finally {
      mongoSession.endSession()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cancel order error:", error)
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 })
  }
}
