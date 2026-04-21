import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { WRITER_PROMPTS } from "@/lib/ai/prompts/writer";
import { ContentType } from "@/lib/types/agent";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

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
    const body: WriterRequest = await request.json();
    const { contentType, tone, context } = body;

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

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const rawText =
      response.content[0].type === "text" ? response.content[0].text : "{}";

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
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    });
  } catch (error) {
    console.error("Writer agent error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar conteúdo" },
      { status: 500 }
    );
  }
}
