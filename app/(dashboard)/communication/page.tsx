"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Conversation, Message, AISuggestedReply } from "@/lib/types/communication";
import { MOCK_CONVERSATIONS } from "@/lib/mock/conversations";
import { MessageBubble } from "@/components/communication/MessageBubble";
import { AISuggestionBar } from "@/components/communication/AISuggestionBar";
import { Avatar, Badge, Button, EmptyState } from "@/components/ui";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  Search, Mail, MessageSquare, Globe, Phone,
  Bot, Send, Paperclip, Smile, Zap,
  Filter, MoreHorizontal, Phone as PhoneIcon,
  Calendar, FileText, ArrowRight, RefreshCw,
  CheckCheck, Archive,
} from "lucide-react";
import { toast } from "sonner";

const CHANNEL_CONFIG: Record<string, {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}> = {
  email: { label: "E-mail", icon: Mail, color: "text-info", bg: "bg-info/10" },
  whatsapp: { label: "WhatsApp", icon: MessageSquare, color: "text-success", bg: "bg-success/10" },
  webchat: { label: "Chat", icon: Globe, color: "text-arkos-blue-light", bg: "bg-arkos-blue/10" },
  phone: { label: "Telefone", icon: Phone, color: "text-warning", bg: "bg-warning/10" },
  ai: { label: "IA", icon: Bot, color: "text-arkos-gold", bg: "bg-arkos-gold/10" },
};

const STATUS_UNREAD_COLOR: Record<number, string> = {
  0: "",
  1: "bg-info",
};

export default function CommunicationPage() {
  const [conversations, setConversations] = useState<Conversation[]>(
    MOCK_CONVERSATIONS
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    MOCK_CONVERSATIONS[0]?.id || null
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "open" | "mine">("all");
  const [inputValue, setInputValue] = useState("");
  const [activeChannel, setActiveChannel] = useState<string>("whatsapp");
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestedReply | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const selectedConv = conversations.find((c) => c.id === selectedId) || null;

  // Atualizar canal ativo quando muda a conversa
  useEffect(() => {
    if (selectedConv) {
      setActiveChannel(selectedConv.activeChannel);
      setAiSuggestion(null);
      setInputValue("");
      // Marcar como lido
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId ? { ...c, unreadCount: 0 } : c
        )
      );
    }
  }, [selectedId, selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv?.messages]);

  // Gerar sugestão da IA
  const generateSuggestion = useCallback(async () => {
    if (!selectedConv || selectedConv.messages.length === 0) return;

    const lastInbound = [...selectedConv.messages]
      .reverse()
      .find((m) => m.direction === "inbound");

    if (!lastInbound) return;

    setIsLoadingSuggestion(true);
    setAiSuggestion(null);

    try {
      const res = await fetch("/api/agents/followup/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation: selectedConv.messages.slice(-6).map((m) => ({
            senderName: m.senderName || (m.direction === "outbound" ? "Vendedor" : selectedConv.contactName),
            content: m.content,
          })),
          lastMessage: lastInbound.content,
          context: {
            contactName: selectedConv.contactName,
            company: selectedConv.company,
            dealStage: "Proposta",
            dealValue: 85000,
            channel: activeChannel,
          },
        }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setAiSuggestion(data);
    } catch {
      toast.error("Erro ao gerar sugestão");
    } finally {
      setIsLoadingSuggestion(false);
    }
  }, [selectedConv, activeChannel]);

  // Enviar mensagem
  const sendMessage = async () => {
    const text = inputValue.trim();
    if (!text || !selectedConv || isSending) return;

    setIsSending(true);

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConv.id,
      channel: activeChannel as Message["channel"],
      direction: "outbound",
      senderType: "user",
      senderName: "Maria Santos",
      content: text,
      contentType: "text",
      status: "sending",
      createdAt: new Date().toISOString(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConv.id
          ? {
              ...c,
              messages: [...c.messages, newMessage],
              lastMessage: newMessage,
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );

    setInputValue("");
    setAiSuggestion(null);

    // Simular envio
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConv.id
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === newMessage.id ? { ...m, status: "sent" } : m
                ),
              }
            : c
        )
      );
      setIsSending(false);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Filtrar conversas
  const filteredConvs = conversations.filter((c) => {
    const matchSearch =
      !search ||
      c.contactName.toLowerCase().includes(search.toLowerCase()) ||
      (c.company || "").toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "all" ||
      (filter === "unread" && c.unreadCount > 0) ||
      (filter === "open" && c.status === "open") ||
      (filter === "mine" && c.assignedToName === "Maria Santos");

    return matchSearch && matchFilter;
  });

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <div className="space-y-4">

      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-text-primary">
              Comunicação
            </h1>
            {totalUnread > 0 && (
              <Badge variant="danger" dot dotAnimate>
                {totalUnread} não lidas
              </Badge>
            )}
          </div>
          <p className="text-sm text-text-muted mt-0.5">
            Todos os canais em um só lugar
          </p>
        </div>

        {/* Canal stats */}
        <div className="flex items-center gap-2">
          {Object.entries(CHANNEL_CONFIG).slice(0, 3).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const count = conversations.filter((c) =>
              c.channels.includes(key as Message["channel"])
            ).length;
            if (count === 0) return null;
            return (
              <div
                key={key}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border",
                  "border-arkos-border bg-arkos-surface text-xs font-medium",
                  cfg.color
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {count}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── LAYOUT SPLIT ─── */}
      <div
        className="rounded-2xl border border-arkos-border overflow-hidden"
        style={{ height: "calc(100vh - 200px)" }}
      >
        <div className="flex h-full">

          {/* ─── LISTA DE CONVERSAS (30%) ─── */}
          <div className="w-80 shrink-0 flex flex-col border-r border-arkos-border">

            {/* Search + filtros */}
            <div className="p-3 space-y-2 border-b border-arkos-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar conversa..."
                  className="w-full h-8 pl-9 pr-3 rounded-xl text-xs bg-arkos-bg border border-arkos-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arkos-blue transition-all"
                />
              </div>

              <div className="flex gap-1">
                {[
                  { id: "all", label: "Todas" },
                  { id: "unread", label: "Não lidas" },
                  { id: "mine", label: "Minhas" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id as typeof filter)}
                    className={cn(
                      "flex-1 py-1 rounded-lg text-2xs font-medium transition-all",
                      filter === f.id
                        ? "bg-arkos-blue/10 text-arkos-blue-light border border-arkos-blue/20"
                        : "text-text-muted hover:text-text-secondary hover:bg-arkos-surface-2"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto">
              {filteredConvs.map((conv) => {
                const isSelected = conv.id === selectedId;
                const lastMsg = conv.lastMessage;
                const chanConfig = CHANNEL_CONFIG[conv.activeChannel];

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 text-left",
                      "border-b border-arkos-border transition-all duration-200",
                      isSelected
                        ? "bg-arkos-blue/10 border-l-2 border-l-arkos-blue"
                        : "hover:bg-arkos-surface-2 border-l-2 border-l-transparent"
                    )}
                  >
                    <Avatar
                      name={conv.contactName}
                      size="sm"
                      status={conv.status === "open" ? "online" : "offline"}
                    />

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-text-primary truncate">
                          {conv.contactName}
                        </p>
                        <span className="text-2xs text-text-muted shrink-0">
                          {lastMsg && formatRelativeTime(lastMsg.createdAt)}
                        </span>
                      </div>

                      {conv.company && (
                        <p className="text-2xs text-text-muted truncate">
                          {conv.company}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5">
                        {/* Canal */}
                        <div className={cn("p-0.5 rounded", chanConfig?.bg)}>
                          {chanConfig && (
                            <chanConfig.icon
                              className={cn("h-3 w-3", chanConfig.color)}
                            />
                          )}
                        </div>

                        {/* Preview */}
                        <p className="text-2xs text-text-secondary truncate flex-1">
                          {lastMsg?.isAIGenerated && "🤖 "}
                          {lastMsg?.direction === "outbound" && "Você: "}
                          {lastMsg?.content}
                        </p>

                        {/* Unread badge */}
                        {conv.unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-arkos-blue flex items-center justify-center text-2xs font-bold text-white shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── ÁREA DO CHAT (70%) ─── */}
          {selectedConv ? (
            <div className="flex-1 flex flex-col min-w-0">

              {/* Header do chat */}
              <div className="shrink-0 px-4 py-3 border-b border-arkos-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      name={selectedConv.contactName}
                      size="md"
                      status="online"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text-primary truncate">
                        {selectedConv.contactName}
                      </p>
                      <div className="flex items-center gap-2">
                        {selectedConv.company && (
                          <span className="text-xs text-text-muted">
                            {selectedConv.company}
                          </span>
                        )}
                        {selectedConv.dealTitle && (
                          <>
                            <span className="text-text-muted">·</span>
                            <span className="text-xs text-arkos-blue-light truncate">
                              {selectedConv.dealTitle}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações do header */}
                  <div className="flex items-center gap-1 shrink-0">
                    {[
                      { icon: PhoneIcon, label: "Ligar", color: "hover:text-success hover:bg-success/10" },
                      { icon: Calendar, label: "Agendar", color: "hover:text-arkos-gold hover:bg-arkos-gold/10" },
                      { icon: FileText, label: "Ver Negócio", color: "hover:text-arkos-blue-light hover:bg-arkos-blue/10" },
                      { icon: Archive, label: "Arquivar", color: "hover:text-text-secondary hover:bg-arkos-surface-2" },
                    ].map(({ icon: Icon, label, color }) => (
                      <button
                        key={label}
                        title={label}
                        className={cn(
                          "p-2 rounded-xl transition-all text-text-muted",
                          color
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    ))}

                    {/* Botão IA sugestão */}
                    <button
                      onClick={generateSuggestion}
                      disabled={isLoadingSuggestion}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl",
                        "bg-arkos-gold/10 border border-arkos-gold/20",
                        "text-arkos-gold text-xs font-medium",
                        "hover:bg-arkos-gold/20 transition-all",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <Bot className="h-3.5 w-3.5" />
                      IA Sugerir
                    </button>
                  </div>
                </div>

                {/* Canal selector */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-2xs text-text-muted">Canal:</span>
                  {selectedConv.channels.map((channel) => {
                    const cfg = CHANNEL_CONFIG[channel];
                    if (!cfg) return null;
                    const Icon = cfg.icon;
                    const isActive = activeChannel === channel;

                    return (
                      <button
                        key={channel}
                        onClick={() => setActiveChannel(channel)}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-2xs font-medium transition-all",
                          isActive
                            ? cn(cfg.bg, "border-current", cfg.color)
                            : "border-arkos-border text-text-muted hover:border-arkos-border-2"
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {selectedConv.messages.map((message, i) => {
                  const prevMessage = i > 0 ? selectedConv.messages[i - 1] : null;
                  const showAvatar =
                    !prevMessage ||
                    prevMessage.senderType !== message.senderType ||
                    prevMessage.direction !== message.direction;

                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      showAvatar={showAvatar}
                      contactName={selectedConv.contactName}
                    />
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* ─── SUGESTÃO DA IA ─── */}
              <AISuggestionBar
                suggestion={aiSuggestion}
                isLoading={isLoadingSuggestion}
                onAccept={(content) => {
                  setInputValue(content);
                  setAiSuggestion(null);
                  inputRef.current?.focus();
                }}
                onEdit={(content) => {
                  setInputValue(content);
                  setAiSuggestion(null);
                  inputRef.current?.focus();
                }}
                onDismiss={() => setAiSuggestion(null)}
                onRegenerate={generateSuggestion}
              />

              {/* ─── INPUT ─── */}
              <div className="shrink-0 px-4 py-3 border-t border-arkos-border space-y-2">
                <div className="flex items-end gap-2">
                  {/* Toolbar */}
                  <div className="flex items-center gap-1">
                    {[
                      { icon: Paperclip, label: "Anexar" },
                      { icon: Smile, label: "Emoji" },
                    ].map(({ icon: Icon, label }) => (
                      <button
                        key={label}
                        title={label}
                        className="p-2 rounded-lg hover:bg-arkos-surface-2 text-text-muted hover:text-text-primary transition-all"
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    ))}
                  </div>

                  {/* Textarea */}
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Responder via ${CHANNEL_CONFIG[activeChannel]?.label || "mensagem"}...`}
                      rows={1}
                      className={cn(
                        "w-full px-4 py-2.5 rounded-xl text-sm resize-none",
                        "bg-arkos-bg border border-arkos-border",
                        "text-text-primary placeholder:text-text-muted",
                        "focus:outline-none focus:border-arkos-blue focus:ring-1 focus:ring-arkos-blue/40",
                        "transition-all min-h-[44px] max-h-32"
                      )}
                    />
                  </div>

                  {/* Botão enviar */}
                  <Button
                    variant="gold"
                    size="md"
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isSending}
                    loading={isSending}
                    icon={<Send className="h-4 w-4" />}
                  />
                </div>

                <p className="text-2xs text-text-muted text-center">
                  ↵ Enviar · Shift+↵ Nova linha ·
                  <button
                    onClick={generateSuggestion}
                    className="text-arkos-gold hover:underline ml-1"
                  >
                    ✨ Gerar com IA
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={<MessageSquare className="h-8 w-8" />}
                title="Selecione uma conversa"
                description="Escolha uma conversa para começar"
                size="md"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
