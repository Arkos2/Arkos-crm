import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface Message {
  id: string;
  lead_id: string;
  wa_message_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export async function getMessagesByLead(leadId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Message[];
}

export async function saveMessage(message: Omit<Message, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}

export async function deleteMessagesByLead(leadId: string) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('lead_id', leadId);

  if (error) throw error;
}
