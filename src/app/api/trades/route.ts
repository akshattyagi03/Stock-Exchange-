import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { AuthOptions } from "@/app/api/auth/[...nextauth]/options"
import connectDB from "@/lib/dbConnect"
import Order from "@/models/Orders"

export async function GET() {
  try {
    await connectDB()

    const session = await getServerSession(AuthOptions)

    if (!session?.user?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const trades = await Order.find({
      userId: session.user._id,
      status: "EXECUTED",
    }).sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      trades,
    })
  } catch (error) {
    console.error("Trade history error:", error)

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    )
  }
}