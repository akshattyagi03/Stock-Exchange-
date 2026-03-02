import { getServerSession } from "next-auth";
import { AuthOptions } from "@/app/api/auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import OrderModel from "@/models/Orders";
import UserModel from "@/models/User";
import { generateOrderId } from "@/utils/generateOrderId";
import HoldingModel from "@/models/Holdings";
export async function POST(request: Request) {
    await dbConnect();

    const session = await getServerSession(AuthOptions);

    if (!session?.user?._id) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    const userId = new mongoose.Types.ObjectId(session.user._id);

    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    try {
        const { stockName, quantity, price, orderType } =
            await request.json();

        if (!stockName || !quantity || !price || !orderType) {
            throw new Error("Missing required fields");
        }

        if (quantity <= 0 || price <= 0) {
            throw new Error("Invalid quantity or price");
        }

        if (!["buy", "sell"].includes(orderType)) {
            throw new Error("Invalid order type");
        }
        // BUY ORDER LOGIC
        if (orderType === "buy") {
            const requiredAmount = quantity * price;

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
            );

            if (!updatedUser) {
                throw new Error("Insufficient balance");
            }
        }
        //SELL ORDER LOGIC
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
            );

            if (!holding) {
                throw new Error("Insufficient shares to sell");
            }
        }

        const order = await OrderModel.create(
            [
                {
                    orderId: generateOrderId(),
                    stockName: stockName.toUpperCase(),
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
        );

        await mongoSession.commitTransaction();
        mongoSession.endSession();

        return NextResponse.json(
            {
                success: true,
                message: "Order created successfully",
                order: order[0],
            },
            { status: 201 }
        );
    } catch (error: any) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Error creating order",
            },
            { status: 400 }
        );
    }
}