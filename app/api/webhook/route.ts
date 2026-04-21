import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { process_sdr_message } from '@/lib/ai/agent';

// Webhook GET - Exigido pela Meta para validação do Token no Setup
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  // Token fixo ou via Env (você pode colocar qualquer string segura na config do app Meta)
  const verifyToken = process.env.META_VERIFY_TOKEN || 'ARKOS_VERIFY_2026';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook Verificado pela Meta com Sucesso!');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
}

// Webhook POST - Onde as mensagens chegam
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validação básica do formato de envio do WhatsApp Business Cloud API
    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ status: 'ignored_no_message' }, { status: 200 });
    }

    const message = messages[0];
    const contact = value.contacts?.[0];
    
    // Dados Essenciais Extraídos
    const waMessageId = message.id; // wamid.XXXX
    const fromPhone = message.from; // +551199999999
    const contactName = contact?.profile?.name || 'Lead WhatsApp';
    const messageContent = message.text?.body || '';

    if (!messageContent) {
      // Ignorar áudios, imagens por enquanto no MVP
      return NextResponse.json({ status: 'ignored_media' }, { status: 200 });
    }

    // 1. IDEMPOTÊNCIA: Bloquear custos duplicados de mensagem da API da Meta
    const { data: existingMsg } = await supabase
      .from('messages')
      .select('id')
      .eq('wa_message_id', waMessageId)
      .single();

    if (existingMsg) {
      console.log(`[IDEMPOTENCIA] Mensagem ${waMessageId} já processada. Abortando duplicidade.`);
      return NextResponse.json({ status: 'already_processed' }, { status: 200 });
    }

    // 2. BUSCAR OU CRIAR O LEAD
    let { data: lead } = await supabase
      .from('leads')
      .select('id, status')
      .eq('telefone', fromPhone)
      .single();

    if (!lead) {
      console.log(`[NOVO LEAD] Criando lead para o numero ${fromPhone}`);
      const { data: newLead, error: insertError } = await supabase
        .from('leads')
        .insert({
          nome: contactName,
          telefone: fromPhone,
          canal_origem: 'whatsapp_direto',
          status: 'Triagem IA'
        })
        .select()
        .single();
        
      if (insertError) throw insertError;
      lead = newLead;
    }

    // 3. REGISTRAR A MENSAGEM DO USUÁRIO
    await supabase.from('messages').insert({
      lead_id: lead!.id,
      wa_message_id: waMessageId,
      role: 'user',
      content: messageContent,
    });

    // 4. ESTRATÉGIA DE NORMALIZAÇÃO E DELAY HUMANO (5s)
    // Opcional para enviar resposta "typing" para o WhatsApp, aqui apenas atrasamos assincronamente a reposta.
    console.log(`[IA ENGINE] Pensando na resposta para ${contactName}...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 5. ACIONAMENTO DO AGENTE SDR 'LUCAS' (Claude 3.7)
    // Se o lead já passou pra Handoff Humano, a IA não deve mais responder
    if (lead!.status !== 'Handoff Humano') {
      const iaReply = await process_sdr_message(lead!.id, messageContent, fromPhone);
      
      console.log(`[SUCESSO] IA gerou resposta: ${iaReply.substring(0, 50)}...`);
      
      // NOTA: Em produção enviamos a `iaReply` via POST para https://graph.facebook.com/v19.0/WABA_ID/messages
      // Como este é o MVP de arquitetura, o envio externo real exige setup Meta, mas os dados estão salvos!
    } else {
      console.log(`[HANDOFF] Lead ${lead!.id} ignorado pela IA pois requer atendimento humano.`);
    }

    // Sempre retorna 200 pro WhatsApp não tentar reenviar
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Erro Critico Webhook:', error);
    // Retorna 200 mesmo no erro local para a Meta não ficar martelando o servidor (best-practice idempotencia fail open)
    return NextResponse.json({ status: 'error', details: 'Tratado internamente' }, { status: 200 });
  }
}
