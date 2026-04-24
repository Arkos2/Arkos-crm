import { AIConfig, AIResponse } from "./types";

const CLAUDE_MODELS = {
  sonnet: "claude-3-5-sonnet-20241022",
  haiku: "claude-3-5-haiku-20241022",
};

export async function callClaude(prompt: string, config?: AIConfig): Promise<AIResponse> {
  // No Cloudflare, as variáveis podem estar no process.env ou no contexto global
  const apiKey = process.env.ANTHROPIC_API_KEY || 
                 process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY ||
                 (globalThis as any).ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY não configurada.");
  }

  const model = config?.model || CLAUDE_MODELS.sonnet;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: model,
      max_tokens: config?.maxTokens || 4096,
      temperature: config?.temperature || 0.7,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  
  return {
    text: data.content[0].text,
    usage: {
      input_tokens: data.usage?.input_tokens || 0,
      output_tokens: data.usage?.output_tokens || 0,
    },
  };
}
