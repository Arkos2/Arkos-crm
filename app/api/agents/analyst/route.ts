
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai/service";
import { ANALYST_SYSTEM_PROMPT } from "@/lib/ai/prompts/analyst";



export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pipelineData, config } = body;

    const userMessage = `Analise os seguintes dados do pipeline da ARKOS e gere insights acionáveis:

## DADOS DO PIPELINE
${JSON.stringify(pipelineData, null, 2)}

Gere entre 3 e 6 insights prioritários baseados nesses dados.`;

    const { text: rawText, usage } = await generateText(ANALYST_SYSTEM_PROMPT + "\n\n" + userMessage, config);

    

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
      tokensUsed: (usage?.input_tokens || 0) + (usage?.output_tokens || 0),
    });
  } catch (error) {
    console.error("Analyst agent error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar análise" },
      { status: 500 }
    );
  }
}
