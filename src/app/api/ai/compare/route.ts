import { NextRequest } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { AuthOptions } from "@/app/api/auth/[...nextauth]/options";
import { streamGeminiResponse } from "@/lib/gemini";

const compareSchema = z.object({
    stock1: z.string().min(1),
    stock2: z.string().min(1),
});

export async function POST(req: NextRequest) {
    const session = await getServerSession(AuthOptions);

    if (!session || !session.user?._id) {
        return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const parsed = compareSchema.safeParse(body);

    if (!parsed.success) {
        return new Response("Invalid input", { status: 400 });
    }

    const { stock1, stock2 } = parsed.data;

    const prompt = `
Compare ${stock1} and ${stock2}.

Provide:
- Summary
- Strengths
- Risks
- Long term verdict
- Short term verdict
`;

    const stream = await streamGeminiResponse(prompt);

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
}