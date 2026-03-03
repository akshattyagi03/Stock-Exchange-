import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AuthOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import HoldingModel from "@/models/Holdings";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(AuthOptions);
    
    if (!session || !session.user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    const holdings = await HoldingModel.find({ user: session.user._id });
    
    return NextResponse.json({ holdings }, { status: 200 });
  } catch (error) {
    console.error("Error fetching holdings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
