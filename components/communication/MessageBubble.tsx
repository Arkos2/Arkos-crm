import { Message } from "@/lib/types/communication";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Bot, Check, CheckCheck, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui";

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
  contactName?: string;
}

const STATUS_ICONS = {
  sending: <Clock className="h-3 w-3 text-text-muted" />,
  sent: <Check className="h-3 w-3 text-text-muted" />,
  delivered: <CheckCheck className="h-3 w-3 text-text-muted" />,
  read: <CheckCheck className="h-3 w-3 text-info" />,
  failed: <AlertCircle className="h-3 w-3 text-danger" />,
};

const CHANNEL_LABEL: Record<string, string> = {
  email: "📧",
  whatsapp: "💬",
  webchat: "🌐",
  phone: "📞",
  linkedin: "💼",
  ai: "🤖",
};

export function MessageBubble({
  message,
  showAvatar = true,
  contactName = "Lead",
}: MessageBubbleProps) {
  const isOutbound = message.direction === "outbound";
  const isAI = message.isAIGenerated || message.senderType === "ai_agent";

  return (
    <div
      className={cn(
        "flex gap-2.5 group",
        isOutbound && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      {showAvatar && (
        <div className="shrink-0 mt-auto mb-1">
          {isAI ? (
            <div className="w-7 h-7 rounded-full bg-arkos-gold/10 border border-arkos-gold/30 flex items-center justify-center">
              <Bot className="h-3.5 w-3.5 text-arkos-gold" />
            </div>
          ) : !isOutbound ? (
            <div className="w-7 h-7 rounded-full bg-arkos-blue/10 border border-arkos-blue/20 flex items-center justify-center text-2xs font-bold text-arkos-blue-light">
              {contactName[0]}
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-2xs font-bold text-success">
              {(message.senderName || "V")[0]}
            </div>
          )}
        </div>
      )}

      {/* Bolha */}
      <div
        className={cn(
          "max-w-[72%] space-y-1",
          isOutbound && "items-end flex flex-col"
        )}
      >
        {/* Nome + canal */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-1",
            isOutbound && "flex-row-reverse"
          )}
        >
          <span className="text-2xs font-semibold text-text-muted">
            {isAI
              ? "Agente IA"
              : isOutbound
              ? message.senderName || "Você"
              : contactName}
          </span>
          <span className="text-xs">{CHANNEL_LABEL[message.channel]}</span>
          {isAI && (
            <Badge variant="gold" size="sm">IA</Badge>
          )}
        </div>

        {/* Assunto (e-mail) */}
        {message.subject && (
          <div
            className={cn(
              "px-3 py-1 rounded-t-xl text-2xs font-semibold",
              isOutbound
                ? "bg-arkos-blue-dark/50 text-arkos-blue-light text-right"
                : "bg-arkos-surface-3 text-text-secondary"
            )}
          >
            {message.subject}
          </div>
        )}

        {/* Conteúdo */}
        <div
          className={cn(
            "px-3.5 py-2.5 text-sm leading-relaxed",
            // Outbound (você enviou)
            isOutbound && !isAI && "bg-arkos-blue text-white rounded-2xl rounded-tr-sm",
            // IA enviou
            isAI && isOutbound && "bg-arkos-gold/10 border border-arkos-gold/20 text-text-primary rounded-2xl rounded-tr-sm",
            // Inbound (lead enviou)
            !isOutbound && "bg-arkos-surface-2 border border-arkos-border text-text-primary rounded-2xl rounded-tl-sm",
            // Se tem assunto (e-mail), remover borda do topo
            message.subject && "rounded-t-none"
          )}
        >
          <p className="whitespace-pre-line">{message.content}</p>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.attachments.map((att) => (
                <a
                  key={att.url}
                  href={att.url}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-black/10 hover:bg-black/20 transition-colors"
                >
                  <span className="text-xs">📎</span>
                  <span className="text-xs truncate">{att.name}</span>
                  <span className="text-2xs opacity-60 ml-auto">{att.size}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp + status */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-1",
            isOutbound && "flex-row-reverse"
          )}
        >
          <span className="text-2xs text-text-muted">
            {formatRelativeTime(message.createdAt)}
          </span>
          {isOutbound && STATUS_ICONS[message.status]}
          {message.readAt && !isOutbound && (
            <span className="text-2xs text-info">Lido</span>
          )}
        </div>
      </div>
    </div>
  );
}
