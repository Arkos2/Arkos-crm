import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ─── TIPOS ADAPTADOS PARA O ESQUEMA ATUAL ───
export interface LeadContext {
  id: string;
  nome: string;
  telefone: string;
  status: string;
  faturamento_mensal: number;
  bantScore: {
    budget: number;
    authority: number;
    need: number;
    timeline: number;
    total: number;
  };
  messageHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

export interface AgentResponse {
  message: string;
  bantUpdate: {
    budget: number;
    authority: number;
    need: number;
    timeline: number;
  };
  nextAction:
    | "continue"
    | "schedule_meeting"
    | "send_proposal"
    | "send_materials"
    | "transfer_human"
    | "disqualify";
  confidence: number;
  internalNote: string;
  useButtons?: boolean;
  buttons?: Array<{ id: string; title: string }>;
}

// ─── SYSTEM PROMPT DO LUCAS (REVISADO PELA ARKOS) ───
const LUCAS_SYSTEM_PROMPT = `Você é Lucas, o SDR (Sales Development Representative) digital da ARKOS — empresa especializada em automação empresarial com IA.

## SUA PERSONALIDADE
- Nome: Lucas (não mencione que é IA, a menos que perguntado diretamente)
- Tom: Profissional, empático, direto e levemente descontraído
- Nunca pressione. Nunca seja insistente. Respeite o ritmo do lead.
- Limite: 2-3 parágrafos por mensagem. WhatsApp não é e-mail.
- Use emojis com moderação (1-2 por mensagem máximo)

## METODOLOGIA: SPIN + BANT
Faça perguntas na ordem SPIN para descobrir o contexto antes de vender:

**S - Situação:** "Como vocês gerenciam [processo] hoje?"
**P - Problema:** "Quais são os maiores desafios com isso?"
**I - Implicação:** "O que acontece quando isso falha?"
**N - Need-Payoff:** "Se isso fosse resolvido, qual seria o impacto?"

Paralelo ao SPIN, colete BANT naturalmente:
- **Budget:** Qual o faturamento mensal ou verba para o projeto?
- **Authority:** Quem mais participa da decisão?
- **Need:** Qual o problema central? (já coberto pelo SPIN)
- **Timeline:** Para quando precisam da solução?

## CONTEXTO DA ARKOS
- Produto: CRM com IA + Automação Empresarial + ERP + BI
- Diferencial: 6 Agentes de IA, implementação em 30 dias, suporte dedicado
- Ticket médio: R$ 25.000 a R$ 150.000
- Setores mais fortes: Saúde (Clínicas), Logística, Educação, Financeiro.
- Cases: Hospital Santa Clara (ROI em 8 meses), LogiMax (-15% perdas)

## FLUXO DA CONVERSA
1. Acolhimento e Pergunta de Contexto (SPIN-S)
2. Descoberta de Dores (SPIN-P/I) e coleta de BANT
3. Qualificação e Apresentação de valor (BANT-B/A)
4. Proposta de Reunião (BANT ≥ 70) 

## FORMATO DE RESPOSTA (OBRIGATÓRIO JSON)
Retorne SEMPRE um JSON válido:
{
  "message": "texto para o lead (sem markdown)",
  "bantUpdate": {
    "budget": 0-25,
    "authority": 0-25,
    "need": 0-25,
    "timeline": 0-25
  },
  "nextAction": "continue|schedule_meeting|send_proposal|send_materials|transfer_human|disqualify",
  "confidence": 0-100,
  "internalNote": "nota interna para o CRM",
  "useButtons": false,
  "buttons": []
}`;

// ─── PROCESSAR MENSAGEM DO SDR (LUCAS) ───
export async function process_sdr_message(
  lead_id: string,
  newMessage: string,
  phone: string
): Promise<AgentResponse> {
  try {
    // 1. Pega Contexto do Lead e Histórico
    const { data: lead } = await supabase
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .single();

    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("lead_id", lead_id)
      .order("created_at", { ascending: true })
      .limit(12);

    const formattedHistory: Anthropic.MessageParam[] = (history || []).map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    }));

    // Adiciona a nova mensagem enviada
    formattedHistory.push({ role: "user", content: newMessage });

    const contextPrompt = `
## CONTEXTO DO LEAD ATUAL
- Nome: ${lead.nome || "Não informado"}
- Telefone: ${phone}
- Status: ${lead.status}
- Faturamento Atual Mapeado: ${lead.faturamento_mensal || 0}
- BANT Atual: 
  - Budget: ${lead.score_bant_budget || 0}/25
  - Authority: ${lead.score_bant_authority || 0}/25
  - Need: ${lead.score_bant_need || 0}/25
  - Timeline: ${lead.score_bant_timeline || 0}/25

Responda à última mensagem do lead de forma natural e estratégica.`;

    // 2. Chama o Claude 3.7 Sonnet
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1500,
      temperature: 0.7,
      system: LUCAS_SYSTEM_PROMPT + "\n\n" + contextPrompt,
      messages: formattedHistory,
    });

    const rawText = response.content[0].type === "text" ? response.content[0].text : "{}";

    // Extrair JSON
    let parsed: AgentResponse;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : getDefaultResponse();
    } catch {
      console.error("Erro ao parsear resposta do Claude:", rawText);
      parsed = getDefaultResponse();
    }

    // 3. Persistência de Dados (BANT e Status)
    if (parsed.bantUpdate) {
      const newBant = {
        score_bant_budget: Math.max(lead.score_bant_budget || 0, parsed.bantUpdate.budget),
        score_bant_authority: Math.max(lead.score_bant_authority || 0, parsed.bantUpdate.authority),
        score_bant_need: Math.max(lead.score_bant_need || 0, parsed.bantUpdate.need),
        score_bant_timeline: Math.max(lead.score_bant_timeline || 0, parsed.bantUpdate.timeline),
      };

      // Atualizar no Supabase
      await supabase
        .from("leads")
        .update({
          ...newBant,
          // Se BANT alto, mudar status se necessário
          status: getStatusFromAction(parsed.nextAction, lead.status)
        })
        .eq("id", lead_id);
    }

    // 4. Salvar resposta no Log do BD
    if (parsed.message) {
      await supabase.from("messages").insert({
        lead_id,
        wa_message_id: "internal_" + Date.now().toString(),
        role: "assistant",
        content: parsed.message,
      });
    }

    return parsed;
  } catch (error) {
    console.error("Erro na Engine Lucas:", error);
    return getDefaultResponse();
  }
}

function getDefaultResponse(): AgentResponse {
  return {
    message: "Tudo bem! Como posso te ajudar hoje?",
    bantUpdate: { budget: 0, authority: 0, need: 0, timeline: 0 },
    nextAction: "continue",
    confidence: 0,
    internalNote: "Erro IA - Fallback",
  };
}

function getStatusFromAction(action: string, currentStatus: string): string {
  if (action === "schedule_meeting") return "Gold >300k"; // Ou status de agendado
  if (action === "transfer_human") return "Handoff Humano";
  if (action === "disqualify") return "inativo";
  return currentStatus;
}
