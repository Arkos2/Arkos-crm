
import { NextRequest, NextResponse } from "next/server";
import { analyzeText } from "@/lib/gemini";
import { INBOUND_ENRICHMENT_PROMPT } from "@/lib/ai/prompts/prospector";



export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prospect } = body;

    const userMessage = `Analise e enriqueça este lead inbound que acabou de chegar:

## DADOS RECEBIDOS
- Nome: ${prospect.rawData?.name || "Não informado"}
- E-mail: ${prospect.rawData?.email || "Não informado"}
- Telefone: ${prospect.rawData?.phone || "Não informado"}
- Empresa: ${prospect.rawData?.company || "Não informada"}
- Mensagem/Interesse: ${prospect.rawData?.message || "Não informada"}
- Página que visitou: ${prospect.rawData?.pageVisited || "Não informada"}
- Fonte: ${prospect.source || "website"}
- UTM Campaign: ${prospect.rawData?.utmCampaign || "Orgânico"}

Enriqueça, calcule o FIT Score e sugira a melhor abordagem.`;

    const rawText = await analyzeText(INBOUND_ENRICHMENT_PROMPT + "\n\n" + userMessage);
    const response = { usage: { input_tokens: 0, output_tokens: 0 } };

    

    let parsed;
    try {
      // Extrair JSON
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      parsed = {};
    }

    return NextResponse.json({
      ...parsed,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      enrichedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Prospector enrich error:", error);
    return NextResponse.json(
      { error: "Erro ao enriquecer lead" },
      { status: 500 }
    );
  }
}
