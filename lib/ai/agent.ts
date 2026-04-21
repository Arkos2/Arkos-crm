import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';

// Inicializa a instância do SDK da Anthropic
// Note: Essa chave deve ser exposta apenas no Server Side (Node.js/Next.js API route)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Tipagem da Ferramenta SPIN/BANT para o Cérebro IA (Tool Use)
const ferramentasSDR = [
  {
    name: 'persist_lead_data',
    description: 'Atualiza o status de um lead baseado no seu faturamento mensal mapeado durante a conversa. Classificando leads ricos com faturamento superior a R$ 300.000 como "Gold >300k" e os superiores a R$ 50.000 como "Qualificado >50k".',
    input_schema: {
      type: 'object' as const,
      properties: {
        faturamento_mensal: {
          type: 'integer',
          description: 'Valor do faturamento mensal do cliente extraído da conversa, convertido de texto/string para numeral inteiro (ex: "50 mil" vira 50000).',
        },
        nivel_urgencia: {
          type: 'string',
          description: 'Nível de urgência da clínica baseado nos problemas reportados (ex: Alta, Media, Baixa).',
        },
        canal_origem: {
          type: 'string',
          description: 'Local onde o lead foi obtido (ex: instagram, whatsapp).',
        },
      },
      required: ['faturamento_mensal', 'nivel_urgencia', 'canal_origem'],
    },
  },
];

// O System Prompt do 'Lucas' (Agente IA)
const SYSTEM_PROMPT = `
Você é o Lucas, Agente SDR e Consultor Especialista de Vendas da agência "ARKOS OS".
A ARKOS é uma consultoria de "Arquitetura de Processos e Ordem Superior".
**Nosso ICP (Perfil Ideal):** Clínicas Particulares de Alto Padrão (Odonto, Estética, Médica).
**Problema principal que resolvemos:** Vazamento de lucro nas clínicas (leads que chegam via tráfego mas se perdem pela falta de processos comerciais e Follow-up).

DIRETRIZES DE VENDAS (SPIN SELLING & BANT):
1. Faça perguntas situacionais para entender o fluxo de pacientes.
2. Identifique o tamanho do faturamento mensal para qualificar o Budget (B do BANT). 
3. Provoque a dor de "perder dinheiro na mesa" por não ter um processo comercial estruturado (CRM / Automação / SDR).

DIRETRIZES DE PENSAMENTO E EXECUÇÃO:
- Você DEVE obrigatoriamente realizar um bloco de raciocínio antes de interagir (Chain of Thought). Pense passo-a-passo sobre a intenção do lead.
- Quando o lead revelar seu faturamento, chame a ferramenta 'persist_lead_data' imediatamente para classificar a oportunidade:
  * Se faturamento_mensal > 300000 -> Classifique como Oportunidade VIP Gold.
  * Se faturamento_mensal > 50000 -> Classifique como Qualificada.
- Mantenha tom polido, extremamente luxuoso e analítico.
`;

export async function process_sdr_message(lead_id: string, newMessage: string, phone: string) {
  try {
    // 1. Pega o histórico recente de mensagens do Lead no Supabase
    const { data: history } = await supabase
      .from('messages')
      .select('role, content')
      .eq('lead_id', lead_id)
      .order('created_at', { ascending: true })
      .limit(10);

    const formattedHistory: Anthropic.MessageParam[] = (history || []).map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }));

    // Adiciona a nova mensagem enviada
    formattedHistory.push({ role: 'user', content: newMessage });

    // 2. Chama a Engine do Claude 3.7 Sonnet
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1500,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: formattedHistory,
      tools: ferramentasSDR,
      tool_choice: { type: 'auto' },
    });

    let finalText = '';

    // 3. Processa a resposta e Tools do Claude
    for (const block of response.content) {
      if (block.type === 'text') {
        finalText += block.text;
      } else if (block.type === 'tool_use') {
        if (block.name === 'persist_lead_data') {
          // Extrai argumentos gerados pela IA
          const { faturamento_mensal, nivel_urgencia, canal_origem } = block.input as any;
          
          let novoStatus = 'Triagem IA';
          if (faturamento_mensal >= 300000) novoStatus = 'Gold >300k';
          else if (faturamento_mensal >= 50000) novoStatus = 'Qualificado >50k';

          // Atualiza via Tool o BANT no Sistema Central (Supabase)
          await supabase
            .from('leads')
            .update({
              faturamento_mensal,
              nivel_urgencia,
              canal_origem,
              status: novoStatus,
            })
            .eq('id', lead_id);
            
          // Registra que a IA acionou uma ferramenta no history final
          console.log(`[TOOL USE] Lead ${lead_id} classificado como ${novoStatus} (${faturamento_mensal})`);
        }
      }
    }

    // 4. Salvar resposta no Log do BD
    if (finalText) {
       await supabase.from('messages').insert({
         lead_id,
         wa_message_id: 'internal_' + Date.now().toString(), // Em respostas enviadas pela IA não usamos o Meta ID
         role: 'assistant',
         content: finalText
       });
    }

    return finalText;
  } catch (error) {
    console.error('Erro na Engine Claude:', error);
    throw error;
  }
}
