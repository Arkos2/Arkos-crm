
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai/service";
import { WRITER_PROMPTS } from "@/lib/ai/prompts/writer";
import { ContentType } from "@/lib/types/agent";



interface WriterRequest {
  contentType: ContentType;
  tone: "formal" | "professional" | "casual";
  context: {
    leadName?: string;
    company?: string;
    industry?: string;
    lastInteraction?: string;
    dealValue?: number;
    problem?: string;
    desiredState?: string;
    notes?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentType, tone, context, config } = body;

    const systemPrompt = WRITER_PROMPTS[contentType];
    if (!systemPrompt) {
      return NextResponse.json(
        { error: "Tipo de conteúdo inválido" },
        { status: 400 }
      );
    }

    const userMessage = `Tom desejado: ${tone}

Contexto do lead:
- Nome: ${context.leadName || "Não informado"}
- Empresa: ${context.company || "Não informada"}
- Setor: ${context.industry || "Não informado"}
- Último contato: ${context.lastInteraction || "Primeiro contato"}
- Valor estimado: ${context.dealValue ? `R$ ${context.dealValue.toLocaleString("pt-BR")}` : "A definir"}
- Problema identificado: ${context.problem || "Não identificado"}
- Estado desejado: ${context.desiredState || "Não definido"}
- Notas adicionais: ${context.notes || "Nenhuma"}

Gere o conteúdo conforme solicitado.`;

    const { text: rawText, usage } = await generateText(systemPrompt + "\n\n" + userMessage, config);

    

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { body: rawText };
    }

    return NextResponse.json({
      ...parsed,
      contentType,
      tokensUsed: (usage?.input_tokens || 0) + (usage?.output_tokens || 0),
    });
  } catch (error) {
    console.error("Writer agent error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar conteúdo" },
      { status: 500 }
    );
  }
}
