export type MessageChannel = "email" | "whatsapp" | "webchat" | "phone" | "linkedin" | "ai";
export type MessageDirection = "inbound" | "outbound";
export type MessageSenderType = "user" | "contact" | "ai_agent";
export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";
export type ConversationStatus = "open" | "snoozed" | "resolved" | "archived";

// ─── MENSAGEM ───
export interface Message {
  id: string;
  conversationId: string;
  channel: MessageChannel;
  direction: MessageDirection;
  senderType: MessageSenderType;
  senderName?: string;
  senderId?: string;
  content: string;
  contentType: "text" | "html" | "image" | "file" | "audio";
  status: MessageStatus;
  isAIGenerated?: boolean;
  aiAgentType?: string;
  subject?: string;
  attachments?: Array<{ name: string; url: string; size: string }>;
  readAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

// ─── CONVERSA ───
export interface Conversation {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar?: string;
  company?: string;
  dealId?: string;
  dealTitle?: string;
  assignedTo?: string;
  assignedToName?: string;
  channels: MessageChannel[];
  activeChannel: MessageChannel;
  lastMessage?: Message;
  unreadCount: number;
  status: ConversationStatus;
  tags?: string[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// ─── RESPOSTA SUGERIDA PELA IA ───
export interface AISuggestedReply {
  content: string;
  reasoning: string;
  tone: "formal" | "professional" | "casual";
  confidence: number;
}
