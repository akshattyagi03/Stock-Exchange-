import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AuthOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";

const accountSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  orderExecutionAlerts: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(AuthOptions);
  if (!session?.user?._id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const body = await req.json();
    const parsed = accountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, password, orderExecutionAlerts } = parsed.data;
    const user = await UserModel.findById(session.user._id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (name) user.name = name;
    if (typeof orderExecutionAlerts === "boolean") user.orderExecutionAlerts = orderExecutionAlerts;
    
    if (password) {
      if (user.authProvider !== "credentials") {
        return NextResponse.json({ error: "Cannot change password for OAuth users" }, { status: 400 });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return NextResponse.json({ message: "Account updated successfully" });
  } catch (error) {
    console.error("Settings Account API Error:", error);
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 });
  }
}
