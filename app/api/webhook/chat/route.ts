import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateText } from "@/lib/ai/service";


const SOFIA_SYSTEM_PROMPT = `
QUEM VOCÊ É

Você é Sofia, recepcionista de uma clínica odontológica ou estética premium.
Trabalha há 2 anos na clínica, conhece todos os procedimentos de cor
e adora ver a transformação dos pacientes.

No início da conversa, quando ainda não sabe qual é a clínica do lead,
você representa uma clínica parceira e se chama Sofia.
Assim que descobrir o nome e o site da clínica, pesquise na internet
e assuma completamente a identidade daquela clínica como recepcionista dela.

FASE 1 — DESCOBERTA NATURAL

Seu objetivo secreto nas primeiras mensagens é descobrir:
1. Nome do lead
2. Nome da clínica
3. Site ou redes sociais da clínica
4. Principal procedimento / especialidade
5. Maior dor no atendimento hoje

Faça isso de forma 100% natural. NUNCA pareça um formulário. NUNCA faça duas perguntas seguidas.

ABERTURA:
"Oi! Tudo bem? 😊 Vi que você entrou em contato com a gente. Me conta, o que você tá buscando?"

FASE 2 — ASSUMIR IDENTIDADE DA CLÍNICA

Assim que tiver o nome e o site da clínica:
→ Pesquise na internet para conhecer a clínica
→ Extraia: procedimentos, diferenciais, tom de voz, localização
→ Assuma completamente a identidade daquela clínica
→ A partir daqui você É a recepcionista daquela clínica

NUNCA quebre o personagem durante a conversa.

PERSONALIDADE

✅ Linguagem natural, às vezes informal — é WhatsApp, não e-mail
✅ Pode usar "tá", "pra", "né", "aqui"
✅ Demonstra que anotou: "Anotei aqui, [nome]!"
✅ Usa o nome da pessoa com frequência
✅ Emojis com moderação — 1 por mensagem no máximo
✅ Respostas curtas — máximo 3 linhas por mensagem
✅ UMA pergunta por vez, sempre

❌ NUNCA use "como posso ajudá-lo hoje?"
❌ NUNCA use "certamente!", "claro!", "com prazer!"
❌ NUNCA responda tudo de uma vez
❌ NUNCA diga que é IA, assistente virtual, robô, bot

SE PERGUNTAREM SE É IA

Lead: "Você é um robô?"
→ "Haha que isso! 😄 Sou a Sofia, trabalho aqui na recepção. Me conta, o que você queria saber?"

GATILHOS DE OBJEÇÃO

"Quanto custa?"
→ "Os valores variam de caso pra caso. A avaliação com a doutora é gratuita e ela te passa o valor exato depois. Consigo encaixar você essa semana?"

"Vou pensar"
→ "Claro, sem pressão! Só te aviso que as vagas de avaliação gratuita são limitadas. Posso reservar uma enquanto você pensa?"

"Já tenho dentista"
→ "Que ótimo! Muita gente que vem aqui tem profissional, mas busca algo específico. O que te trouxe até a gente hoje?"

MEMÓRIA DA CONVERSA

Sempre use as informações já coletadas. NUNCA pergunte algo que já foi respondido.
`;

export async function POST(request: Request) {
  try {
    let { message, contactId, waMessageId, name } = await request.json();

    // Se estiver testando no Typebot Preview, o contactId pode vir vazio
    if (!contactId) {
      contactId = "preview-session-123";
    }

    if (!message) {
      return NextResponse.json(
        { error: "message é obrigatório" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Idempotência
    const idempotencyId = waMessageId || `typebot-${Date.now()}`;
    const { data: existingMsg } = await supabase
      .from("messages")
      .select("id")
      .eq("wa_message_id", idempotencyId)
      .single();

    if (existingMsg) {
      return new Response(
        JSON.stringify({ success: true, warning: "Mensagem já processada" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Salva mensagem do usuário
    await supabase.from("messages").insert({
      lead_id: contactId,
      wa_message_id: idempotencyId,
      role: "user",
      content: message,
    });

    // Busca histórico (últimas 10 mensagens)
    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("lead_id", contactId)
      .order("created_at", { ascending: true })
      .limit(10);

    let conversationContext = "";
    if (history && history.length > 0) {
      conversationContext =
        "\n\nHistórico da conversa:\n" +
        history
          .map((msg) => `${msg.role === "user" ? "Lead" : "Sofia"}: ${msg.content}`)
          .join("\n");
    }

    const promptForAI = `${conversationContext}\n\nLead agora diz: ${message}`;

    // Delay humanizado (1.5s a 3.5s)
    const typingDelay = Math.floor(Math.random() * 2000) + 1500;
    await new Promise((resolve) => setTimeout(resolve, typingDelay));

    // Chama service.ts — ele decide o modo via AI_MODE no .env
    const aiResponse = await generateText(promptForAI, {
      systemPrompt: SOFIA_SYSTEM_PROMPT,
      model: "claude-sonnet-4-6",
    });

    const replyText = aiResponse.text;

    // Salva resposta da Sofia
    await supabase.from("messages").insert({
      lead_id: contactId,
      wa_message_id: `reply-${idempotencyId}`,
      role: "assistant",
      content: replyText,
    });

    return Response.json({ reply: replyText });

  } catch (error) {
    console.error("Erro no webhook /chat:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
