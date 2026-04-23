
import { NextRequest, NextResponse } from "next/server";
import { analyzeText } from "@/lib/gemini";
import { OUTBOUND_SEARCH_PROMPT } from "@/lib/ai/prompts/prospector";
import { OutboundSearchQuery } from "@/lib/types/prospector";



const SIZE_LABELS: Record<string, string> = {
  micro: "Micro (1-9 funcionários)",
  small: "Pequena (10-49 funcionários)",
  medium: "Média (50-199 funcionários)",
  large: "Grande (200-999 funcionários)",
  enterprise: "Enterprise (1000+ funcionários)",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query: OutboundSearchQuery = body.query;

    const userMessage = `Gere uma lista de ${query.limit || 8} empresas para prospecção outbound B2B com os seguintes critérios:

## CRITÉRIOS DE BUSCA
- Setores: ${query.industries.join(", ")}
- Tamanhos: ${query.sizes.map((s) => SIZE_LABELS[s] || s).join(", ")}
- Cargos alvo: ${query.roles.join(", ")}
- Localização: ${query.location || "Brasil (qualquer estado)"}
- Dores/Keywords: ${query.painPoints?.join(", ") || "Automação, processos manuais, integração"}
- Palavras-chave adicionais: ${query.keywords?.join(", ") || "Nenhuma"}

Gere empresas com FIT scores variados (algumas high priority, algumas medium, algumas low) para ser realista.
Foque em empresas do Brasil com características verossímeis.`;

    const rawText = await analyzeText(OUTBOUND_SEARCH_PROMPT + "\n\n" + userMessage);
    const response = { usage: { input_tokens: 0, output_tokens: 0 } };

    

    let prospects = [];
    try {
      const arrayMatch = rawText.match(/\[[\s\S]*\]/);
      prospects = arrayMatch ? JSON.parse(arrayMatch[0]) : [];
    } catch {
      prospects = [];
    }

    // Normalizar e adicionar IDs
    const normalized = prospects.map(
      (p: Record<string, unknown>, i: number) => ({
        id: `outbound-${Date.now()}-${i}`,
        flow: "outbound",
        status: "scored",
        source: "prospector_ai",
        rawData: {},
        ...p,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        receivedAt: new Date().toISOString(),
        scoredAt: new Date().toISOString(),
        enrichedAt: new Date().toISOString(),
      })
    );

    return NextResponse.json({
      prospects: normalized,
      totalFound: normalized.length,
      searchedAt: new Date().toISOString(),
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      query,
    });
  } catch (error) {
    console.error("Prospector search error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar prospects" },
      { status: 500 }
    );
  }
}
