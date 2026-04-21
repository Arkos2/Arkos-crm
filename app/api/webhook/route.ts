import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { process_sdr_message } from '@/lib/ai/agent';
import { 
  sendTextMessage, 
  sendButtonMessage, 
  markAsRead, 
  formatPhoneNumber 
} from '@/lib/whatsapp';

// ─── VERIFICAÇÃO DO WEBHOOK (GET) ───
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  // Token fixo ou via Env
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'ARKOS_VERIFY_2026';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Webhook Verificado pela Meta com Sucesso!');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
}

// ─── RECEBER MENSAGENS E STATUS (POST) ───
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    // 1. PROCESSAR STATUS DE ENTREGA/LEITURA (Status updates)
    if (value?.statuses && value.statuses.length > 0) {
      const status = value.statuses[0];
      console.log(`📊 Status Update: ${status.status} para mensagem ${status.id}`);
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    }

    // 2. PROCESSAR MENSAGENS RECEBIDAS
    const messages = value?.messages;
    if (!messages || messages.length === 0) {
      return NextResponse.json({ status: 'no_messages' }, { status: 200 });
    }

    const message = messages[0];
    const contact = value.contacts?.[0];
    
    const waMessageId = message.id;
    const fromPhoneRaw = message.from;
    const fromPhone = formatPhoneNumber(fromPhoneRaw);
    const contactName = contact?.profile?.name || 'Lead WhatsApp';
    
    // Extrair conteúdo da mensagem
    let messageContent = '';
    if (message.type === 'text') {
      messageContent = message.text?.body || '';
    } else if (message.type === 'interactive' && message.interactive?.button_reply) {
      messageContent = message.interactive.button_reply.title;
    }

    if (!messageContent) {
      // Ignorar mídias por enquanto no MVP
      await markAsRead(waMessageId);
      return NextResponse.json({ status: 'ignored_media' }, { status: 200 });
    }

    // A. IDEMPOTÊNCIA
    const { data: existingMsg } = await supabase
      .from('messages')
      .select('id')
      .eq('wa_message_id', waMessageId)
      .single();

    if (existingMsg) {
      return NextResponse.json({ status: 'already_processed' }, { status: 200 });
    }

    // B. MARCAR COMO LIDO NA META
    await markAsRead(waMessageId);

    // C. BUSCAR OU CRIAR O LEAD
    let { data: lead } = await supabase
      .from('leads')
      .select('id, status, nome')
      .eq('telefone', fromPhone)
      .single();

    if (!lead) {
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

    // D. REGISTRAR A MENSAGEM DO USUÁRIO
    await supabase.from('messages').insert({
      lead_id: lead!.id,
      wa_message_id: waMessageId,
      role: 'user',
      content: messageContent,
    });

    // E. ACIONAMENTO DA IA (LUCAS)
    if (lead!.status !== 'Handoff Humano') {
      console.log(`🤖 Lucas processando resposta para ${lead!.nome || fromPhone}...`);
      
      const agentResponse = await process_sdr_message(lead!.id, messageContent, fromPhone);
      
      // F. ENVIO REAL PARA O WHATSAPP
      let sendResult;
      if (agentResponse.useButtons && agentResponse.buttons && agentResponse.buttons.length > 0) {
        sendResult = await sendButtonMessage(
          fromPhone,
          agentResponse.message,
          agentResponse.buttons
        );
      } else {
        sendResult = await sendTextMessage(fromPhone, agentResponse.message);
      }

      if (sendResult.success) {
        console.log(`✅ Resposta enviada com sucesso: ${sendResult.messageId}`);
      } else {
        console.error(`❌ Erro ao enviar resposta: ${sendResult.error}`);
      }
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Erro Crítico Webhook:', error);
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}
