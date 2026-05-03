import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AuthOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import HoldingModel from "@/models/Holdings";
import { renderToBuffer } from "@react-pdf/renderer";
import { HoldingsPDFDocument } from "@/lib/pdf-generator";

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

export async function POST() {
  try {
    const session = await getServerSession(AuthOptions);
    
    if (!session || !session.user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    const holdings = await HoldingModel.find({ user: session.user._id });
    
    let totalInvestment = 0;
    const holdingsData = holdings.map(holding => {
      const totalQty = holding.availableQuantity + holding.frozenQuantity;
      const investment = totalQty * holding.averageBuyPrice;
      totalInvestment += investment;
      return {
        stockName: holding.stockName,
        availableQuantity: holding.availableQuantity,
        frozenQuantity: holding.frozenQuantity,
        totalQty,
        averageBuyPrice: holding.averageBuyPrice,
        investment,
      };
    });

    const pdfDoc = HoldingsPDFDocument({
      userName: session.user.name || session.user.email || "User",
      generatedDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      totalHoldings: holdings.length,
      holdings: holdingsData,
      totalInvestment,
    });

    const pdfBuffer = await renderToBuffer(pdfDoc);
    const pdfArray = new Uint8Array(pdfBuffer);

    return new NextResponse(pdfArray, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="holdings-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating holdings report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
