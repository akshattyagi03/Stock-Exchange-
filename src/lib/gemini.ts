import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY");
}

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Use the model your API key supports
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export async function streamGeminiResponse(prompt: string) {
  const structuredPrompt = `
You are a professional financial analyst.

Never mention the AI model or provider in your response.

${prompt}
`;

  try {
    const result = await model.generateContentStream(structuredPrompt);

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
        } catch (streamError) {
          console.error("Stream error:", streamError);
          controller.error(streamError);
        } finally {
          controller.close();
        }
      },
    });

  } catch (error) {
    console.error("Gemini generation error:", error);
    throw error;
  }
}