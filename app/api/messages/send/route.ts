import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTextMessage } from '@/lib/whatsapp';

export async function POST(request: Request) {
  const supabase = await createClient();
  
  try {
    const { leadId, content, phone } = await request.json();

    if (!leadId || !content || !phone) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    }

    // 1. Enviar via WhatsApp API
    const result = await sendTextMessage(phone, content);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // 2. Salvar no Banco de Dados
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        lead_id: leadId,
        role: 'assistant', // O CRM atua como o assistente/empresa
        content: content,
        wa_message_id: result.messageId || `out-${Date.now()}`
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar mensagem:', error);
      // Retornamos sucesso do envio mesmo se falhar no log do banco
    }

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return NextResponse.json({ error: 'Erro interno ao enviar mensagem' }, { status: 500 });
  }
}
