import { AIConfig, AIResponse, AIProvider } from "./types";
import { analyzeText as callGemini } from "../gemini";
import { callClaude } from "./anthropic";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type AIMode = "claude" | "gemini" | "gemini+claude";

// ─── Gemini com Google Search (Grounding) ─────────────────────────────────────
async function callGeminiWithSearch(prompt: string): Promise<string> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    (globalThis as any).GEMINI_API_KEY;

  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada.");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini Search API error: ${await response.text()}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// ─── Claude com Web Search nativo (Anthropic Tool Use) ────────────────────────
async function callClaudeWithSearch(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const apiKey =
    process.env.ANTHROPIC_API_KEY ||
    (globalThis as any).ANTHROPIC_API_KEY;

  if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada.");

  const tools = [
    {
      type: "web_search_20250305",
      name: "web_search",
    },
  ];

  const messages: any[] = [{ role: "user", content: userMessage }];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "web-search-2025-03-05",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages,
    }),
  });

  if (!response.ok) throw new Error(`Claude API error: ${await response.text()}`);

  const data = await response.json();

  // web_search_20250305 retorna resultados inline nos content blocks.
  // Extrair todos os blocos de texto da resposta final.
  const textBlocks = (data.content || [])
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text);

  return textBlocks.join("\n") || "";
}

// ─── Orquestrador Principal ───────────────────────────────────────────────────
export async function generateText(
  prompt: string,
  config?: AIConfig & { systemPrompt?: string }
): Promise<AIResponse> {
  // Lê o modo do .env — padrão é "claude" se não definido
  const mode = (
    process.env.AI_MODE ||
    (globalThis as any).AI_MODE ||
    "claude"
  ).toLowerCase() as AIMode;

  const systemPrompt = config?.systemPrompt ?? "";

  console.log(`[AI Service] Modo: ${mode}`);

  try {
    // ── MODO 1: somente Claude (busca + conversa) ──────────────────────────
    if (mode === "claude") {
      console.log("[AI Service] Usando Claude com web search nativo");
      const text = await callClaudeWithSearch(systemPrompt, prompt);
      return { text };
    }

    // ── MODO 2: Gemini busca → Claude conversa ─────────────────────────────
    if (mode === "gemini+claude") {
      console.log("[AI Service] Gemini buscando dados da clínica...");
      const searchResult = await callGeminiWithSearch(
        `Pesquise informações sobre esta clínica para personalizar um atendimento: ${prompt}`
      );

      console.log("[AI Service] Claude conduzindo a conversa com os dados...");
      const enrichedPrompt = `
Dados pesquisados sobre a clínica (use para personalizar):
${searchResult}

Mensagem do lead:
${prompt}`;

      const text = await callClaudeWithSearch(systemPrompt, enrichedPrompt);
      return { text };
    }

    // ── MODO 3: somente Gemini (busca + conversa) ──────────────────────────
    if (mode === "gemini") {
      console.log("[AI Service] Usando Gemini com Google Search nativo");
      const fullPrompt = systemPrompt
        ? `${systemPrompt}\n\nMensagem do lead: ${prompt}`
        : prompt;
      const text = await callGeminiWithSearch(fullPrompt);
      return { text };
    }

    // Modo inválido — fallback para Claude
    console.warn(`[AI Service] AI_MODE inválido: "${mode}". Usando Claude como fallback.`);
    const text = await callClaudeWithSearch(systemPrompt, prompt);
    return { text };

  } catch (error: any) {
    // ── FALLBACK AUTOMÁTICO ────────────────────────────────────────────────
    console.error(`[AI Service] Erro no modo "${mode}":`, error.message || error);
    console.log("[AI Service] Iniciando fallback automático...");

    try {
      // Se Claude falhou, tenta Gemini — e vice-versa
      if (mode === "claude" || mode === "gemini+claude") {
        console.log("[AI Service] Fallback para Gemini");
        const text = await callGemini(prompt);
        return { text };
      } else {
        console.log("[AI Service] Fallback para Claude");
        const text = await callClaudeWithSearch(systemPrompt, prompt);
        return { text };
      }
    } catch (fallbackError: any) {
      console.error("[AI Service] Falha crítica — ambos os provedores falharam.");
      throw new Error(
        `Falha na IA: verifique ANTHROPIC_API_KEY e GEMINI_API_KEY no Cloudflare.`
      );
    }
  }
}
