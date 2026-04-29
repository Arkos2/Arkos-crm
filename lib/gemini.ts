// lib/gemini.ts — lazy initialization: API key only required at runtime, not build time
import { GoogleGenerativeAI } from "@google/generative-ai";

import { getEnv } from "./env";

function getClient(): GoogleGenerativeAI {
  const apiKey = getEnv("GEMINI_API_KEY");

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada no Cloudflare.");
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

export async function analyzeText(prompt: string, customModel?: string): Promise<string> {
  const modelName = customModel || "gemini-2.0-flash";
  const model = getClient().getGenerativeModel({ model: modelName });
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