import { createClient } from "@/lib/supabase/client";
import { Conversation, Message } from "@/lib/types/communication";

const supabase = createClient();

export async function getConversations(): Promise<Conversation[]> {
  // 1. Buscar todos os leads que possuem mensagens, incluindo as mensagens
  const { data: leads, error } = await supabase
    .from('leads')
    .select(`
      id,
      nome,
      telefone,
      empresa,
      status,
      messages (*)
    `)
    .order('created_at', { foreignTable: 'messages', ascending: true });

  if (error) {
    console.error("Erro ao buscar conversas:", error);
    throw error;
  }

  // 2. Formatar para o padrão da UI
  return (leads || [])
    .filter((lead: any) => lead.messages && lead.messages.length > 0)
    .map((lead: any) => {
      const messages: Message[] = lead.messages.map((m: any) => ({
        id: m.id,
        conversationId: lead.id,
        channel: "whatsapp",
        direction: m.role === 'user' ? 'inbound' : 'outbound',
        senderName: m.role === 'user' ? lead.nome : 'Sofia',
        senderId: m.role === 'user' ? lead.telefone : 'ARKOS',
        content: m.content,
        contentType: 'text',
        status: 'sent',
        createdAt: m.created_at,
      }));

      const lastMessage = messages[messages.length - 1];

      return {
        id: lead.id,
        contactId: lead.id,
        contactName: lead.nome,
        company: lead.empresa,
        channels: ["whatsapp"],
        activeChannel: "whatsapp",
        lastMessage,
        unreadCount: 0, // Precisaríamos de uma coluna 'read' na tabela messages para calcular
        status: "open",
        messages,
        createdAt: lead.created_at,
        updatedAt: lastMessage?.createdAt || lead.created_at,
        metadata: { phone: lead.telefone }
      } as any;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}
