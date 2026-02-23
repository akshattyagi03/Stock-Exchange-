import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { z } from "zod";
import { emailSchema } from "@/schemas/inputSchema/emailSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const emailParam = searchParams.get("email");

        if (!emailParam) {
            const response: ApiResponse = {
                success: false,
                message: "Email query parameter is required",
            };
            return NextResponse.json(response, { status: 400 });
        }
        const parsedEmail = emailSchema.safeParse(emailParam);
        if (!parsedEmail.success) {
            const response: ApiResponse = {
                success: false,
                message: parsedEmail.error.issues[0].message,
            };
            return NextResponse.json(response, { status: 400 });
        }
        const email = parsedEmail.data;
        const existingUser = await UserModel.exists({ email }).select("_id");
        if (existingUser) {
            return NextResponse.json(
                {
                    success: true,
                    available: false,
                    message: "Email unavailable",
                },
                { status: 200 }
            );
        }
        return NextResponse.json(
            {
                success: true,
                available: true,
                message: "Email available",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error checking email uniqueness:", error);
        const response: ApiResponse = {
            success: false,
            message: "Error checking email uniqueness"
        }
        return NextResponse.json(response, { status: 500 });
    }
}