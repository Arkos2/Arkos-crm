"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { ChatMessage, BANTCollection, QualifierConversation } from "@/lib/types/agent";
import { BANTLiveMeter } from "./BANTLiveMeter";
import { Avatar, Badge, Button } from "@/components/ui";
import {
  Bot, Send, Plus, Phone, Mail, Calendar,
} from "lucide-react";
import { toast } from "sonner";

interface ChatInterfaceProps {
  conversation: QualifierConversation;
  onUpdate: (updates: Partial<QualifierConversation>) => void;
  onCreateDeal?: (conv: QualifierConversation) => void;
}

const DEFAULT_BANT: BANTCollection = {
  budget: 0, authority: 0, need: 0, timeline: 0, total: 0,
};

export function ChatInterface({
  conversation,
  onUpdate,
  onCreateDeal,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentBant, setCurrentBant] = useState<BANTCollection>(
    conversation.bant || DEFAULT_BANT
  );
  const [internalNote, setInternalNote] = useState<string>("");
  const [showNote, setShowNote] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [conversation.messages]);

  const initConversation = useCallback(async () => {
    if (conversation.messages.length > 0) return;

    setIsLoading(true);
    try {
      const savedSettings = localStorage.getItem("arkos_ai_settings");
      const aiConfig = savedSettings ? JSON.parse(savedSettings) : {};

      const res = await fetch("/api/agents/qualifier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: conversation.id,
          messages: [],
          isFirstMessage: true,
          leadContext: {
            name: conversation.leadName,
            company: conversation.company,
          },
          config: {
            model: aiConfig.model,
            temperature: aiConfig.temperature
          }
        }),
      });

      const data = await res.json();

      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: data.message,
        timestamp: new Date().toISOString(),
        isAI: true,
        agentType: "qualifier",
        metadata: { bantUpdate: data.bant, confidence: data.confidence },
      };

      onUpdate({
        messages: [aiMessage],
        bant: { ...DEFAULT_BANT, ...data.bant },
      });
      setCurrentBant({ ...DEFAULT_BANT, ...data.bant });
    } catch {
      toast.error("Erro ao inicializar conversa");
    } finally {
      setIsLoading(false);
    }
  }, [conversation.id, conversation.messages.length, conversation.leadName, conversation.company, onUpdate]);

  useEffect(() => {
    initConversation();
  }, [initConversation]);

  const sendMessage = async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
      isAI: false,
    };

    const updatedMessages = [...conversation.messages, userMessage];
    onUpdate({ messages: updatedMessages });
    setInputValue("");
    setIsLoading(true);

    try {
      const savedSettings = localStorage.getItem("arkos_ai_settings");
      const aiConfig = savedSettings ? JSON.parse(savedSettings) : {};

      const res = await fetch("/api/agents/qualifier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: conversation.id,
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          leadContext: {
            name: conversation.leadName,
            company: conversation.company,
          },
          config: {
            model: aiConfig.model,
            temperature: aiConfig.temperature
          }
        }),
      });

      const data = await res.json();

      const newBant: BANTCollection = {
        budget: Math.max(currentBant.budget, data.bant?.budget || 0),
        authority: Math.max(currentBant.authority, data.bant?.authority || 0),
        need: Math.max(currentBant.need, data.bant?.need || 0),
        timeline: Math.max(currentBant.timeline, data.bant?.timeline || 0),
        total: 0,
        budgetText: data.bant?.budgetText || currentBant.budgetText,
        authorityText: data.bant?.authorityText || currentBant.authorityText,
        needText: data.bant?.needText || currentBant.needText,
        timelineText: data.bant?.timelineText || currentBant.timelineText,
      };
      newBant.total = newBant.budget + newBant.authority + newBant.need + newBant.timeline;

      const aiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: data.message,
        timestamp: new Date().toISOString(),
        isAI: true,
        agentType: "qualifier",
        metadata: {
          bantUpdate: data.bant,
          confidence: data.confidence,
          tokensUsed: data.tokensUsed,
        },
      };

      const finalMessages = [...updatedMessages, aiMessage];
      onUpdate({ messages: finalMessages, bant: newBant });
      setCurrentBant(newBant);

      if (data.internalNote) {
        setInternalNote(data.internalNote);
      }

      if (data.nextAction === "schedule_meeting" && newBant.total >= 70) {
        toast.success("Lead qualificado! Pronto para criar negócio.", {
          action: {
            label: "Criar Negócio",
            onClick: () => onCreateDeal?.(conversation),
          },
        });
      } else if (data.nextAction === "transfer_to_human") {
        toast.info("Agente sugere transferir para um consultor humano.");
      }
    } catch {
      toast.error("Erro ao processar mensagem");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">

      {/* ─── HEADER ─── */}
      <div className="shrink-0 px-4 py-3 border-b border-arkos-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={conversation.leadName} size="md" status="online" />
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {conversation.leadName}
              </p>
              <div className="flex items-center gap-2">
                {conversation.company && (
                  <span className="text-xs text-text-muted">{conversation.company}</span>
                )}
                <Badge
                  variant={
                    conversation.channel === "whatsapp" ? "success"
                    : conversation.channel === "webchat" ? "info"
                    : "default"
                  }
                  size="sm"
                >
                  {conversation.channel === "whatsapp" ? "💬 WhatsApp"
                    : conversation.channel === "webchat" ? "🌐 Chat"
                    : "📧 E-mail"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button title="Ligar" className="p-2 rounded-lg hover:bg-success/10 text-text-muted hover:text-success transition-all">
              <Phone className="h-4 w-4" />
            </button>
            <button title="E-mail" className="p-2 rounded-lg hover:bg-info/10 text-text-muted hover:text-info transition-all">
              <Mail className="h-4 w-4" />
            </button>
            <button title="Agendar" className="p-2 rounded-lg hover:bg-arkos-gold/10 text-text-muted hover:text-arkos-gold transition-all">
              <Calendar className="h-4 w-4" />
            </button>
            {currentBant.total >= 70 && (
              <Button
                variant="gold"
                size="xs"
                icon={<Plus className="h-3 w-3" />}
                onClick={() => onCreateDeal?.(conversation)}
              >
                Criar Negócio
              </Button>
            )}
          </div>
        </div>

        {/* BANT compacto */}
        <BANTLiveMeter bant={currentBant} compact />

        {/* Nota interna */}
        {internalNote && (
          <button
            onClick={() => setShowNote(!showNote)}
            className="flex items-start gap-2 w-full text-left px-3 py-2 rounded-xl bg-arkos-gold/5 border border-arkos-gold/20 hover:border-arkos-gold/40 transition-all"
          >
            <Bot className="h-3.5 w-3.5 text-arkos-gold shrink-0 mt-0.5" />
            <div>
              <p className="text-2xs font-semibold text-arkos-gold">
                Nota interna da IA (só você vê)
              </p>
              <p className="text-2xs text-text-secondary mt-0.5">
                {showNote ? internalNote : internalNote.slice(0, 70) + "..."}
              </p>
            </div>
          </button>
        )}
      </div>

      {/* ─── MENSAGENS ─── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Typing indicator ao inicializar */}
        {conversation.messages.length === 0 && isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-arkos-gold/10 border border-arkos-gold/20 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-arkos-gold" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-arkos-surface-2 border border-arkos-border">
              <div className="flex items-center gap-1">
                {[0, 150, 300].map((delay) => (
                  <div key={delay} className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {conversation.messages.map((message, index) => {
          const isAI = message.role === "assistant";
          const isLast = index === conversation.messages.length - 1;

          return (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-slide-in-up",
                !isAI && "flex-row-reverse"
              )}
            >
              <div className="shrink-0">
                {isAI ? (
                  <div className="w-8 h-8 rounded-full bg-arkos-gold/10 border border-arkos-gold/20 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-arkos-gold" />
                  </div>
                ) : (
                  <Avatar name={conversation.leadName} size="sm" />
                )}
              </div>

              <div className={cn("max-w-[75%] space-y-1", !isAI && "items-end")}>
                <div
                  className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    isAI
                      ? "bg-arkos-surface-2 border border-arkos-border rounded-tl-sm text-text-primary"
                      : "bg-arkos-blue rounded-tr-sm text-white"
                  )}
                >
                  {message.content.split("\n").map((line, i, arr) => (
                    <span key={i}>
                      {line.replace(/\*\*(.*?)\*\*/g, "$1")}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))}
                </div>

                <div className={cn("flex items-center gap-2", !isAI && "flex-row-reverse")}>
                  <span className="text-2xs text-text-muted">
                    {formatRelativeTime(message.timestamp)}
                  </span>
                  {isAI && message.metadata?.confidence !== undefined && (
                    <span className="text-2xs text-text-muted">
                      {message.metadata.confidence}% conf.
                    </span>
                  )}
                </div>

                {/* BANT badges na última msg da IA */}
                {isAI && isLast && message.metadata?.bantUpdate && (() => {
                  const update = message.metadata.bantUpdate as Partial<BANTCollection>;
                  const hasUpdate = (["budget","authority","need","timeline"] as const).some(
                    (k) => (update[k] as number | undefined) && (update[k] as number) > 0
                  );
                  if (!hasUpdate) return null;
                  return (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-2xs text-text-muted">Coletado:</span>
                      {(["budget","authority","need","timeline"] as const).map((key) => {
                        const val = update[key] as number | undefined;
                        if (!val || val === 0) return null;
                        return (
                          <Badge key={key} variant="gold" size="sm">
                            {key[0].toUpperCase()}: {val}
                          </Badge>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}

        {/* Typing indicator após envio */}
        {isLoading && conversation.messages.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-arkos-gold/10 border border-arkos-gold/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-arkos-gold" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-arkos-surface-2 border border-arkos-border">
              <div className="flex items-center gap-1">
                {[0, 150, 300].map((delay) => (
                  <div key={delay} className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─── INPUT ─── */}
      <div className="shrink-0 px-4 py-3 border-t border-arkos-border space-y-2">
        {conversation.messages.length > 0 && !isLoading && (
          <div className="flex gap-2 overflow-x-auto">
            {["Assumir conversa", "Adicionar nota", "Ver histórico"].map((action) => (
              <button
                key={action}
                className="shrink-0 px-3 py-1 rounded-full border border-arkos-border text-2xs text-text-muted hover:text-text-primary hover:border-arkos-blue/40 transition-all bg-arkos-surface"
              >
                {action}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Responder como o lead (simulação) ou intervenção manual..."
              rows={1}
              className={cn(
                "w-full px-4 py-3 rounded-xl text-sm resize-none",
                "bg-arkos-bg border border-arkos-border",
                "text-text-primary placeholder:text-text-muted",
                "focus:outline-none focus:border-arkos-blue focus:ring-1 focus:ring-arkos-blue/40",
                "transition-all duration-200 min-h-[44px] max-h-32"
              )}
            />
          </div>
          <Button
            variant="gold"
            size="md"
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            loading={isLoading}
            icon={<Send className="h-4 w-4" />}
          />
        </div>

        <p className="text-2xs text-text-muted text-center">
          ↵ Enter para enviar · Shift+Enter para nova linha ·
          <span className="text-arkos-gold"> Powered by Claude</span>
        </p>
      </div>
    </div>
  );
}
