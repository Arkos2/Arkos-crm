import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { generateText } from "@/lib/ai/service";
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
    const { query, config } = body;

    const userMessage = `Gere uma lista de ${query.limit || 8} empresas para prospecção outbound B2B com os seguintes critérios:

## CRITÉRIOS DE BUSCA
- Setores: ${query.industries.join(", ")}
- Tamanhos: ${query.sizes.map((s: string) => SIZE_LABELS[s] || s).join(", ")}
- Cargos alvo: ${query.roles.join(", ")}
- Localização: ${query.locations.join(", ") || "Brasil (qualquer estado)"}
- Nicho Específico: ${query.nicheDescription || "Não especificado"}
- Detalhes do ICP (Faturamento/Perfil): ${query.icpDetails || "Não especificado"}
- Dores/Keywords: ${query.painPoints?.join(", ") || "Automação, processos manuais, integração"}
- Palavras-chave adicionais: ${query.keywords?.join(", ") || "Nenhuma"}

Gere empresas com FIT scores variados (algumas high priority, algumas medium, algumas low) para ser realista.
Foque em empresas do Brasil com características verossímeis.`;

    const { text: rawText, usage } = await generateText(OUTBOUND_SEARCH_PROMPT + "\n\n" + userMessage, config);

    

    let prospects = [];
    try {
      try {
        prospects = JSON.parse(rawText);
      } catch {
        const arrayMatch = rawText.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          try {
            prospects = JSON.parse(arrayMatch[0]);
          } catch {
            const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const cleanMatch = cleaned.match(/\[[\s\S]*\]/);
            prospects = cleanMatch ? JSON.parse(cleanMatch[0]) : [];
          }
        }
      }
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
      tokensUsed: (usage?.input_tokens || 0) + (usage?.output_tokens || 0),
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
