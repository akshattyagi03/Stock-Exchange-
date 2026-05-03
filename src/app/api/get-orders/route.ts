import { getServerSession } from "next-auth"
import mongoose from "mongoose"
import { NextResponse } from "next/server"

import { AuthOptions } from "../auth/[...nextauth]/options"
import dbConnect from "@/lib/dbConnect"
import OrderModel from "@/models/Orders"

export async function GET() {
  await dbConnect()

  const session = await getServerSession(AuthOptions)

  if (!session?.user?._id) {
    return NextResponse.json(
      { success: false, message: "User not authenticated" },
      { status: 401 }
    )
  }

  const userId = new mongoose.Types.ObjectId(session.user._id)

  try {
    const orders = await OrderModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      orders,
    })
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json(
      { success: false, message: "Error fetching orders" },
      { status: 500 }
    )
  }
}
