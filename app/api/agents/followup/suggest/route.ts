
import { NextRequest, NextResponse } from "next/server";
import { analyzeText } from "@/lib/gemini";



const REPLY_SUGGESTION_PROMPT = `Você é um especialista em vendas consultivas B2B da ARKOS.

Analise a conversa e sugira a melhor resposta para o vendedor enviar ao lead.

## CONTEXTO DA ARKOS
- Empresa de automação empresarial e CRM
- Ticket médio: R$ 25k-150k
- Implementação em 30 dias
- Suporte 24/7 + gerente dedicado
- Cases: Saúde, Logística, Educação, Financeiro

## DIRETRIZES
- Seja natural, não robótico
- Responda TODAS as perguntas do lead
- Avance o processo comercial sutilmente
- Não seja ansioso ou desesperado
- Use dados concretos quando possível
- Tom: profissional mas humano

Retorne JSON:
{
  "content": "texto da resposta sugerida",
  "reasoning": "por que essa resposta é a melhor abordagem",
  "tone": "formal|professional|casual",
  "confidence": 0-100,
  "alternativeActions": ["ação alternativa 1", "ação alternativa 2"]
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversation, lastMessage, context } = body;

    const userMessage = `Contexto do negócio:
- Lead: ${context.contactName} (${context.company || "empresa não identificada"})
- Etapa no pipeline: ${context.dealStage || "não informada"}
- Valor do negócio: ${context.dealValue ? `R$ ${context.dealValue.toLocaleString("pt-BR")}` : "a definir"}
- Canal: ${context.channel}

Histórico das últimas mensagens:
${conversation.map((m: { senderName: string; content: string }) => `[${m.senderName}]: ${m.content}`).join("\n")}

Última mensagem do lead:
"${lastMessage}"

Sugira a melhor resposta.`;

    const rawText = await analyzeText(REPLY_SUGGESTION_PROMPT + "\n\n" + userMessage);
    const response = { usage: { input_tokens: 0, output_tokens: 0 } };

    

    let parsed;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: rawText };
    } catch {
      parsed = { content: rawText, confidence: 70 };
    }

    return NextResponse.json({
      ...parsed,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    });
  } catch (error) {
    console.error("Follow-up suggest error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar sugestão" },
      { status: 500 }
    );
  }
}
