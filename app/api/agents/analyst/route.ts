export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ANALYST_SYSTEM_PROMPT } from "@/lib/ai/prompts/analyst";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pipelineData } = body;

    const userMessage = `Analise os seguintes dados do pipeline da ARKOS e gere insights acionáveis:

## DADOS DO PIPELINE
${JSON.stringify(pipelineData, null, 2)}

Gere entre 3 e 6 insights prioritários baseados nesses dados.`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      system: ANALYST_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const rawText =
      response.content[0].type === "text" ? response.content[0].text : "[]";

    let insights;
    try {
      const arrayMatch = rawText.match(/\[[\s\S]*\]/);
      insights = arrayMatch ? JSON.parse(arrayMatch[0]) : [];
    } catch {
      insights = [];
    }

    return NextResponse.json({
      insights: insights.map((insight: Record<string, unknown>, i: number) => ({
        ...insight,
        id: `insight-${Date.now()}-${i}`,
        createdAt: new Date().toISOString(),
      })),
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    });
  } catch (error) {
    console.error("Analyst agent error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar análise" },
      { status: 500 }
    );
  }
}
