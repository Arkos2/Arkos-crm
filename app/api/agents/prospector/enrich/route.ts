
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { INBOUND_ENRICHMENT_PROMPT } from "@/lib/ai/prompts/prospector";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

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

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      system: INBOUND_ENRICHMENT_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const rawText =
      response.content[0].type === "text" ? response.content[0].text : "{}";

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
