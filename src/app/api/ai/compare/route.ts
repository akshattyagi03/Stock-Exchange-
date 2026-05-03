import { NextRequest } from "next/server";
import { z } from "zod";
import { streamGeminiResponse } from "@/lib/gemini";

export const runtime = "nodejs";

const compareSchema = z.object({
  symbols: z.array(z.string().min(1)).min(2).max(4),
  level: z.enum(["beginner", "intermediate", "experienced", "trader"]).default("intermediate"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = compareSchema.safeParse(body);

    if (!parsed.success) {
      return new Response("Invalid input", { status: 400 });
    }

    const { symbols, level } = parsed.data;
    const list = symbols.join(", ");

    const LEVEL_PROMPTS: Record<string, string> = {
      beginner: "Use simple language, avoid complex financial jargon. Explain any basic concepts you mention. Make it easy to understand for someone completely new to investing.",
      intermediate: "Use standard financial terms but briefly explain complex metrics. Assume the user knows the basics but might not be an expert in deep technical analysis.",
      experienced: "Provide detailed technical and fundamental analysis. Use standard financial metrics, ratios, and chart context without over-explaining. Assume high financial literacy.",
      trader: "Be concise, actionable, and focus heavily on technical analysis, price action, momentum, and short-to-medium-term catalysts. Provide advanced metrics without explanation.",
    };

    const levelInstruction = LEVEL_PROMPTS[level] || LEVEL_PROMPTS.intermediate;

    const prompt = `
You are a professional financial advisor AI specialising in Indian stock markets (NSE/BSE).
Compare the following stocks: ${list}.
The user has selected the experience level: ${level.toUpperCase()}.
CRITICAL INSTRUCTION FOR TONE AND COMPLEXITY: ${levelInstruction}

Structure your response exactly as follows:

1. Quick Summary
One sentence per stock describing what the company does and its market position.

2. Key Metrics Comparison
Present a side-by-side comparison of:
- Current Price (₹)
- Market Cap
- P/E Ratio
- Revenue Growth (% YoY)
- Net Profit Margin (%)
- ROE (%)
- Debt-to-Equity Ratio
- Dividend Yield (%)

3. Strengths
For each stock, list 2-3 key competitive strengths.

4. Risks
For each stock, list 2-3 key risks or concerns.

5. Scores (1–10)
Rate each stock on:
- Valuation (1 = overvalued, 10 = undervalued)
- Growth Potential (1 = low, 10 = high)
- Financial Health (1 = weak, 10 = strong)
- Overall Score

6. Verdicts
- Short-term (< 1 year): Which stock and why (2-3 lines)
- Long-term (3–5 years): Which stock and why (2-3 lines)
- Best for income investors: Which stock and why (1-2 lines)

Keep the tone professional and data-driven.
All prices in INR (₹). Be specific with numbers wherever possible.
`;

    const stream = await streamGeminiResponse(prompt);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });

  } catch (error) {
    console.error("AI compare route error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}