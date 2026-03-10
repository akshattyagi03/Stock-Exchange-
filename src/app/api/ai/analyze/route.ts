import { NextRequest } from "next/server";
import { z } from "zod";
import { streamGeminiResponse } from "@/lib/gemini";

export const runtime = "nodejs";

const analyzeSchema = z.object({
  symbol: z.string().min(1, "Stock symbol is required"),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = analyzeSchema.safeParse(body);

    if (!parsed.success) {
      return new Response("Invalid input", { status: 400 });
    }

    const { symbol, messages } = parsed.data;

    // Build conversation history for context
    const history = messages
      .slice(0, -1) // everything except the last message
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n\n")

    const latestQuestion = messages[messages.length - 1].content

    const prompt = `
You are a professional financial advisor AI specialising in Indian stock markets (NSE/BSE).
You are currently analysing the stock: ${symbol}.

${history ? `Previous conversation:\n${history}\n\n` : ""}
User's question: ${latestQuestion}

Guidelines:
- If this is the first message or a general analysis request, provide a structured breakdown covering:
  valuation metrics, financial health, growth indicators, risk scores (1–10), and investment suitability.
- For follow-up questions, answer concisely and reference the stock context.
- Always use specific numbers, percentages, and ratios where possible.
- Keep the tone professional, analytical, and concise.
- Avoid vague statements — prioritise measurable insights.
- Format responses clearly. Use numbered lists or sections when helpful.
- All prices should be in INR (₹).
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