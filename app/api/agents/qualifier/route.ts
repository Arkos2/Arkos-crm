
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai/service";
import { QUALIFIER_SYSTEM_PROMPT, QUALIFIER_FIRST_MESSAGE } from "@/lib/ai/prompts/qualifier";
import { ChatMessage, BANTCollection } from "@/lib/types/agent";
import { createAdminClient } from "@/lib/supabase/admin";



interface QualifierRequest {
  leadId: string;
  messages: ChatMessage[];
  isFirstMessage?: boolean;
  leadContext?: {
    name?: string;
    company?: string;
    source?: string;
  };
  config?: any;
}

interface QualifierResponse {
  message: string;
  bant: Partial<BANTCollection>;
  nextAction: "continue" | "schedule_meeting" | "send_materials" | "transfer_to_human";
  confidence: number;
  internalNote: string;
  tokensUsed?: number;
}

function parseClaude(text: string): QualifierResponse {
  try {
    const json = JSON.parse(text);
    return json;
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // fallback
      }
    }
    return {
      message: text,
      bant: { budget: 0, authority: 0, need: 0, timeline: 0 },
      nextAction: "continue",
      confidence: 0,
      internalNote: "Erro ao parsear resposta da IA",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: QualifierRequest = await request.json();
    const { leadId, messages, isFirstMessage, leadContext, config } = body;

    // 1. Primeira mensagem — retornar template e salvar no banco
    if (isFirstMessage && leadId) {
      const firstResponse = parseClaude(QUALIFIER_FIRST_MESSAGE);

      if (leadContext?.name) {
        firstResponse.message = firstResponse.message.replace(
          "Olá! 👋",
          `Olá, ${leadContext.name}! 👋`
        );
      }

      // Salvar mensagem inicial da IA no banco usando Admin Client
      const adminClient = createAdminClient();
      await adminClient.from('messages').insert({
        lead_id: leadId,
        role: "assistant",
        content: firstResponse.message,
        wa_message_id: `init-${Date.now()}`,
      });

      return NextResponse.json(firstResponse);
    }

    // 2. Salvar última mensagem do usuário (se houver) com Admin Client
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage && lastUserMessage.role === "user" && leadId) {
      const adminClient = createAdminClient();
      await adminClient.from('messages').insert({
        lead_id: leadId,
        role: "user",
        content: lastUserMessage.content,
        wa_message_id: `msg-user-${Date.now()}`,
      });
    }

    // ─── CHAMADA PARA AI ───
    const anthropicMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    let systemPrompt = QUALIFIER_SYSTEM_PROMPT;
    if (leadContext) {
      systemPrompt += `\n\n## CONTEXTO DO LEAD ATUAL
- Nome: ${leadContext.name || "Não informado"}
- Empresa: ${leadContext.company || "Não informada"}
- Fonte: ${leadContext.source || "Não informada"}

Use essas informações para personalizar a conversa.`;
    }

    const { text: rawText, usage } = await generateText(systemPrompt + "\n\n" + JSON.stringify(anthropicMessages), config);

    const parsed = parseClaude(rawText);

    if (leadId) {
      // Salvar a mensagem da IA no banco com Admin Client
      const adminClient = createAdminClient();
      await adminClient.from('messages').insert({
        lead_id: leadId,
        role: "assistant",
        content: parsed.message,
        wa_message_id: `ai-${Date.now()}`,
      });

      // Atualizar o Lead com os dados BANT e Score com Admin Client
      const bant = parsed.bant || {};
      const budget = bant.budget || 0;
      const authority = bant.authority || 0;
      const need = bant.need || 0;
      const timeline = bant.timeline || 0;
      const total = budget + authority + need + timeline;

      await adminClient.from('leads').update({
        score_ia: total,
        faturamento_mensal: bant.budget ? bant.budget * 1000 : undefined, 
        status: total >= 70 ? 'Qualificado' : 'Em Qualificação',
      }).eq('id', leadId);
    }

    return NextResponse.json({
      ...parsed,
      bant: {
        budget: parsed.bant?.budget || 0,
        authority: parsed.bant?.authority || 0,
        need: parsed.bant?.need || 0,
        timeline: parsed.bant?.timeline || 0,
        total: (parsed.bant?.budget || 0) + (parsed.bant?.authority || 0) + (parsed.bant?.need || 0) + (parsed.bant?.timeline || 0),
      },
      tokensUsed: (usage?.input_tokens || 0) + (usage?.output_tokens || 0),
    });
  } catch (error) {
    console.error("Qualifier agent error:", error);
    return NextResponse.json(
      {
        error: "Erro interno do agente",
        message: "Desculpe, ocorreu um erro. Tente novamente.",
        bant: { budget: 0, authority: 0, need: 0, timeline: 0, total: 0 },
        nextAction: "continue",
        confidence: 0,
        internalNote: "Erro na API",
      },
      { status: 500 }
    );
  }
}
