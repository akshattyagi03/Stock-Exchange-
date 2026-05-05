import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

function getModel() {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Missing GEMINI_API_KEY");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

export async function POST(req: NextRequest) {
    try {
        const { indices, gainers, losers } = await req.json();
        const model = getModel();

        const indicesSummary = indices
            .map((i: { name: string; change: number; points: number }) =>
                `${i.name}: ${i.change >= 0 ? "+" : ""}${i.change}% (${i.points} pts)`
            )
            .join(", ");

        const prompt = `You are a financial analyst. Based on this Indian market snapshot:
Indices: ${indicesSummary}
Gainers: ${gainers}, Losers: ${losers}

Write a 2-sentence market insight summary. Be concise, specific, and professional. No disclaimers.`;

        const result = await model.generateContent(prompt);
        const insight = result.response.text();

        return NextResponse.json({ insight });
    } catch (error) {
        console.error("[market-insight] Gemini error:", error);
        return NextResponse.json({ insight: "" }, { status: 500 });
    }
}
