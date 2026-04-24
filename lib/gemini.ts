// lib/gemini.ts — lazy initialization: API key only required at runtime, not build time
import { GoogleGenerativeAI } from "@google/generative-ai";

function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada. Adicione a variável de ambiente no painel da Cloudflare.");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function analyzeImage(
  base64: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  const model = getClient().getGenerativeModel({ model: "gemini-flash-latest" });

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
  const model = getClient().getGenerativeModel({ model: "gemini-flash-latest" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function analyzeWithContext(
  messages: { role: "user" | "model"; content: string }[],
  newMessage: string
): Promise<string> {
  const model = getClient().getGenerativeModel({ model: "gemini-flash-latest" });
  const chat = model.startChat({
    history: messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
  });
  const result = await chat.sendMessage(newMessage);
  return result.response.text();
}