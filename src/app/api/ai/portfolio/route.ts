import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { AuthOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import HoldingModel from "@/models/Holdings";
import UserModel from "@/models/User";
import { streamGeminiResponse } from "@/lib/gemini";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(AuthOptions);
    if (!session?.user?._id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await dbConnect();

    const user = await UserModel.findById(session.user._id).select("tier");
    if (!user || user.tier !== "premium") {
      return new Response("Premium required", { status: 403 });
    }

    const holdings = await HoldingModel.find({ user: session.user._id });

    if (holdings.length === 0) {
      return new Response("No holdings found", { status: 400 });
    }

    const holdingsSummary = holdings.map(h => {
      const totalQty = h.availableQuantity + h.frozenQuantity;
      const investment = totalQty * h.averageBuyPrice;
      return `- ${h.stockName}: ${totalQty} shares @ avg ₹${h.averageBuyPrice.toFixed(2)} (invested ₹${investment.toLocaleString("en-IN")})`
    }).join("\n")

    const totalInvestment = holdings.reduce((sum, h) => {
      return sum + (h.availableQuantity + h.frozenQuantity) * h.averageBuyPrice
    }, 0)

    const prompt = `
You are a professional portfolio analyst specialising in Indian stock markets (NSE/BSE).

Analyse the following portfolio and provide structured insights:

Holdings:
${holdingsSummary}

Total Investment: ₹${totalInvestment.toLocaleString("en-IN")}
Total Stocks: ${holdings.length}

Provide a comprehensive analysis with the following sections:

1. **Portfolio Health Score** (rate out of 10 with reasoning)
2. **Risk Level** (Low / Medium / High with explanation)
3. **Diversification Score** (rate out of 10 with reasoning)
4. **Sector Allocation** (infer likely sectors from stock names and estimate % allocation)
5. **Key Insights** (3-5 actionable bullet points — flag overexposure, suggest rebalancing, identify risks)
6. **Recommendations** (concrete next steps)

Be specific, use numbers, and base everything strictly on the actual holdings provided. Do not make up stocks or data.
`

    const stream = await streamGeminiResponse(prompt);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });

  } catch (error) {
    console.error("Portfolio AI route error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
