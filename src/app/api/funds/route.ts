import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AuthOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function GET() {
  const session = await getServerSession(AuthOptions);

  if (!session?.user?._id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const user = await UserModel.findById(session.user._id).select("availableBalance frozenBalance");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const available = user.availableBalance ?? 999999;
    const frozen = user.frozenBalance ?? 0;

    return NextResponse.json({
      availableBalance: available,
      frozenBalance: frozen,
      totalBalance: available + frozen,
    });
  } catch (error) {
    console.error("Funds API Error:", error);
    return NextResponse.json({ error: "Failed to fetch funds" }, { status: 500 });
  }
}
