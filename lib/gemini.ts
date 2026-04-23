// src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY não configurada");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeImage(
  base64: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent([
    {
      inlineData: {
        data: base64,
        mimeType,
      },
    },
    prompt,
  ]);

  return result.response.text();
}

export async function analyzeText(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function analyzeWithContext(
  messages: { role: "user" | "model"; content: string }[],
  newMessage: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const chat = model.startChat({
    history: messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
  });
  const result = await chat.sendMessage(newMessage);
  return result.response.text();
}