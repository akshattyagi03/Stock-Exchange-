import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/ApiResponse";
import { generateVerificationCode } from "@/utils/generateVerificationCode";
import { generateUsername } from "@/utils/usernameGenerator";
import { signUpSchema } from "@/schemas/authSchema/signUpSchema";
export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();

        const result = signUpSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({
                success: false,
                message: result.error.issues[0].message
            }, { status: 400 });
        }

        const { name, email, password } = result.data;
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            if (existingUser.isVerified) {
                const response: ApiResponse = {
                    success: false,
                    message: "A user already exists with this email."
                }
                return NextResponse.json(response, { status: 400 });
            }
            else {
                const hashedPassword = await bcrypt.hash(password, 10);
                const verifyCode = generateVerificationCode();
                const verifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000);

                const emailResponse = await sendVerificationEmail(email, name, verifyCode);
                if(!emailResponse.success){
                    const response:ApiResponse={
                        success: false,
                        message: "Error sending verification email. Please try again later."
                    }
                    return NextResponse.json(response, {status: 500});
                }
                existingUser.password = hashedPassword;
                existingUser.verifyCode = verifyCode;
                existingUser.verifyCodeExpiry = verifyCodeExpiry;

                await existingUser.save();

                const response: ApiResponse = {
                    success: true,
                    message: "User updated successfully. Verification email sent."
                };

                return NextResponse.json(response, { status: 200 });
            }
        }
        else {
            const verifyCode = generateVerificationCode();
            const verifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000);

            const emailResponse = await sendVerificationEmail(email, name, verifyCode);
            if (!emailResponse.success) {
                const response: ApiResponse = {
                    success: false,
                    message: "Error sending verification email. Please try again later."
                }
                return NextResponse.json(response, { status: 500 });
            }

            const newUser = new UserModel({
                name,
                username: generateUsername(),
                email,
                password: await bcrypt.hash(password, 10),
                verifyCode,
                verifyCodeExpiry,
                isVerified: false
            });
            await newUser.save();

            const response: ApiResponse = {
                success: true,
                message: "User registered successfully. Verification email sent.",
            }
            return NextResponse.json(response, { status: 201 });
        }
    } catch (error) {
        console.error("Error registering user:", error);
        const response: ApiResponse = {
            success: false,
            message: "Failed to register user. Please try again later. ",
        }
        return NextResponse.json(response, { status: 500 });
    }
}