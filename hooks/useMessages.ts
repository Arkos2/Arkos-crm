import useSWR from "swr";
import { getMessagesByLead, saveMessage } from "@/lib/supabase/services/messages";
import { Message } from "@/lib/supabase/services/messages";

export function useMessages(leadId?: string) {
  const { data: messages, error, mutate, isLoading } = useSWR(
    leadId ? `messages-${leadId}` : null,
    () => getMessagesByLead(leadId!)
  );

  return {
    messages: messages || [],
    isLoading,
    isError: error,
    refreshMessages: mutate,
  };
}
