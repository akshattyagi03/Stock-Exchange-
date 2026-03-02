import { getServerSession } from "next-auth";
import { AuthOptions } from "../auth/[...nextauth]/options";
import OrderModel from "@/models/Orders";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  await dbConnect();

  const session = await getServerSession(AuthOptions);

  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "User not authenticated" },
      { status: 401 }
    );
  }

  const userId = new mongoose.Types.ObjectId(session.user._id);

  try {
    const portfolio = await OrderModel.aggregate([
      {
        $match: {
          user: userId,
          status: "executed"
        }
      },
      {
        $group: {
          _id: "$stockName",
          totalQuantity: {
            $sum: {
              $cond: [
                { $eq: ["$orderType", "buy"] },
                "$quantity",
                { $multiply: ["$quantity", -1] }
              ]
            }
          }
        }
      }
    ]);
    return NextResponse.json({
      success: true,
      portfolio
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error fetching portfolio" },
      { status: 500 }
    );
  }
}