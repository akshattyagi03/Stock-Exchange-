import { NextRequest } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { AuthOptions } from "@/app/api/auth/[...nextauth]/options";
import { streamGeminiResponse } from "@/lib/gemini";
export const runtime = "nodejs";

const analyzeSchema = z.object({
  stock: z.string().min(1, "Stock symbol is required"),
});

export async function POST(req: NextRequest) {
  try {
    /*
    const session = await getServerSession(AuthOptions);
    if (!session || !session.user?._id) {
      return new Response("Unauthorized", { status: 401 });
    }
    */
    const body = await req.json();
    const parsed = analyzeSchema.safeParse(body);

    if (!parsed.success) {
      return new Response("Invalid input", { status: 400 });
    }

    const { stock } = parsed.data;

    const prompt = `
Provide a professional, data-driven financial analysis of ${stock}.

Use recent available financial data and include specific numerical metrics wherever possible.

Structure the response as follows:

1. Company Overview
- Market Cap (in USD)
- Sector & Industry
- Current Stock Price
- 52-Week High / Low

2. Valuation Metrics
- P/E Ratio
- Forward P/E
- PEG Ratio
- Price-to-Book (P/B)
- EV/EBITDA
- Dividend Yield (%)

3. Financial Health
- Revenue (latest annual)
- Revenue Growth (% YoY)
- Net Profit Margin (%)
- EPS (latest)
- Debt-to-Equity Ratio
- Current Ratio
- Free Cash Flow

4. Growth & Performance
- 3-Year Revenue CAGR (%)
- 3-Year EPS Growth (%)
- Return on Equity (ROE %)
- Return on Assets (ROA %)

5. Risk Assessment
Provide numerical scores (1–10 scale):
- Volatility (1 = very stable, 10 = highly volatile)
- Financial Risk (1 = very low, 10 = very high)
- Competitive Risk (1 = low, 10 = high)
- Overall Risk Score (1–10)

6. Investment Suitability
- Short-term suitability score (1–10)
- Long-term suitability score (1–10)
- Brief justification (3–5 lines)

Keep the tone professional, analytical, and concise.
Avoid vague statements — prioritize numerical and measurable insights.
`;

    const stream = await streamGeminiResponse(prompt);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });

  } catch (error) {
    console.error("AI analyze route error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}