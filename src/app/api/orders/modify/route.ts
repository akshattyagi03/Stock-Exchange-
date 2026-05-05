import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { AuthOptions } from "@/app/api/auth/[...nextauth]/options"
import dbConnect from "@/lib/dbConnect"
import OrderModel from "@/models/Orders"
import UserModel from "@/models/User"
import mongoose from "mongoose"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(AuthOptions)
    if (!session?.user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId, price, quantity } = await req.json()
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 })

    await dbConnect()

    const order = await OrderModel.findOne({ orderId, user: session.user._id })

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    if (order.status === "executed" || order.status === "cancelled") {
      return NextResponse.json({ error: `Cannot modify a ${order.status} order` }, { status: 400 })
    }

    const newPrice = Number(price)
    const newQuantity = Number(quantity)

    if (newPrice <= 0 || newQuantity <= 0) {
      return NextResponse.json({ error: "Invalid price or quantity" }, { status: 400 })
    }

    const mongoSession = await mongoose.startSession()
    mongoSession.startTransaction()

    try {
      if (order.orderType === "buy") {
        const oldFrozen = order.price * order.remainingQuantity
        const newFrozen = newPrice * newQuantity
        const diff = newFrozen - oldFrozen

        if (diff > 0) {
          const user = await UserModel.findOne(
            { _id: session.user._id, availableBalance: { $gte: diff } },
            null,
            { session: mongoSession }
          )
          if (!user) {
            await mongoSession.abortTransaction()
            return NextResponse.json({ error: "Insufficient balance for modification" }, { status: 400 })
          }
          await UserModel.findByIdAndUpdate(
            session.user._id,
            { $inc: { availableBalance: -diff, frozenBalance: diff } },
            { session: mongoSession }
          )
        } else if (diff < 0) {
          await UserModel.findByIdAndUpdate(
            session.user._id,
            { $inc: { availableBalance: Math.abs(diff), frozenBalance: diff } },
            { session: mongoSession }
          )
        }
      }

      await OrderModel.findByIdAndUpdate(
        order._id,
        { $set: { price: newPrice, quantity: newQuantity, remainingQuantity: newQuantity } },
        { session: mongoSession }
      )

      await mongoSession.commitTransaction()
    } catch (err) {
      await mongoSession.abortTransaction()
      throw err
    } finally {
      mongoSession.endSession()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Modify order error:", error)
    return NextResponse.json({ error: "Failed to modify order" }, { status: 500 })
  }
}
