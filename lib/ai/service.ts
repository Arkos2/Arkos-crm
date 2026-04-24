import { AIConfig, AIResponse, AIProvider } from "./types";
import { analyzeText as callGemini } from "../gemini";
import { callClaude } from "./anthropic";

export async function generateText(prompt: string, config?: AIConfig): Promise<AIResponse> {
  // 1. Determinar o provedor baseado no modelo ou preferência
  const model = config?.model || process.env.NEXT_PUBLIC_AI_MODEL || "gemini-1.5-flash";
  
  let primaryProvider: AIProvider = "gemini";
  if (model.startsWith("claude")) {
    primaryProvider = "anthropic";
  }

  const secondaryProvider: AIProvider = primaryProvider === "gemini" ? "anthropic" : "gemini";

  console.log(`[AI Service] Tentando provedor: ${primaryProvider} (Modelo: ${model})`);

  try {
    return await executeCall(primaryProvider, prompt, { ...config, model });
  } catch (error: any) {
    // Se o erro for de API Key ou similar, tentamos o fallback
    console.error(`[AI Service] Erro no provedor ${primaryProvider}:`, error.message || error);
    console.log(`[AI Service] Iniciando fallback automático para: ${secondaryProvider}`);
    
    try {
      const fallbackModel = secondaryProvider === "anthropic" ? "claude-3-5-sonnet-20241022" : "gemini-1.5-flash";
      return await executeCall(secondaryProvider, prompt, { ...config, model: fallbackModel });
    } catch (fallbackError: any) {
      console.error(`[AI Service] Falha crítica: Ambos os provedores falharam.`);
      console.error(`- Erro Primário (${primaryProvider}):`, error.message || error);
      console.error(`- Erro Fallback (${secondaryProvider}):`, fallbackError.message || fallbackError);
      
      throw new Error(`Falha na IA: ${primaryProvider} e ${secondaryProvider} estão indisponíveis. Verifique as chaves GEMINI_API_KEY e ANTHROPIC_API_KEY no Cloudflare.`);
    }
  }
}

async function executeCall(provider: AIProvider, prompt: string, config?: AIConfig): Promise<AIResponse> {
  if (provider === "gemini") {
    const text = await callGemini(prompt);
    return { text };
  } else {
    return await callClaude(prompt, config);
  }
}
