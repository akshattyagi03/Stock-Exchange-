import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { NextResponse } from "next/server";
export async function POST(request:Request){
    await dbConnect();
    try {
        const {email, code} = await request.json();

        const decodedEmail = decodeURIComponent(email);
        const user = await UserModel.findOne({email: decodedEmail});
        if(!user){
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, {status: 400});
        }
        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();
            return NextResponse.json({
                success: true,
                message: "Code verified successfully"
            }, {status: 200});
        }
        else if(!isCodeNotExpired){
            return NextResponse.json({
                success: false,
                message: "Code expired. Please sign up again to get a new code."
            }, {status: 400});
        }
        else{
            return NextResponse.json({
                success: false,
                message: "Invalid code"
            }, {status: 400})
        }
    } catch (error) {
        console.error("Error verifying code", error);
        return NextResponse.json({
            success: false,
            message: "Failed to verify code. Please try again later."
        }, {status: 400});
    }
}