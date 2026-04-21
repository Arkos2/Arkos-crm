"use client";

import { QualifierConversation } from "@/lib/types/agent";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Avatar, Badge } from "@/components/ui";
import { Bot, Plus, Search } from "lucide-react";
import { useState } from "react";

interface ConversationListProps {
  conversations: QualifierConversation[];
  selectedId?: string;
  onSelect: (conv: QualifierConversation) => void;
  onNew: () => void;
}

const STATUS_CONFIG = {
  active: { label: "Ativa", variant: "info" as const, dot: true },
  qualified: { label: "Qualificado", variant: "success" as const, dot: false },
  disqualified: { label: "Descartado", variant: "danger" as const, dot: false },
  nurturing: { label: "Nutrição", variant: "warning" as const, dot: false },
  transferred: { label: "Transferido", variant: "default" as const, dot: false },
};

function getBantColor(total: number) {
  if (total >= 75) return "text-success";
  if (total >= 50) return "text-warning";
  if (total > 0) return "text-info";
  return "text-text-muted";
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onNew,
}: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "qualified">("all");

  const filtered = conversations.filter((c) => {
    const matchSearch =
      !search ||
      c.leadName.toLowerCase().includes(search.toLowerCase()) ||
      (c.company || "").toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "all" ||
      (filter === "active" && c.status === "active") ||
      (filter === "qualified" && c.status === "qualified");

    return matchSearch && matchFilter;
  });

  return (
    <div className="flex flex-col h-full border-r border-arkos-border">
      {/* Header */}
      <div className="p-4 border-b border-arkos-border space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Conversas</h3>
          <button
            onClick={onNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-arkos-blue/10 border border-arkos-blue/20 text-2xs font-medium text-arkos-blue-light hover:bg-arkos-blue/20 transition-all"
          >
            <Plus className="h-3 w-3" />
            Nova
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar lead..."
            className="w-full h-8 pl-8 pr-3 rounded-lg text-xs bg-arkos-bg border border-arkos-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arkos-blue transition-all"
          />
        </div>

        <div className="flex gap-1">
          {[
            { id: "all", label: "Todas" },
            { id: "active", label: "Ativas" },
            { id: "qualified", label: "Qualificados" },
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
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Bot className="h-8 w-8 text-text-muted mb-2" />
            <p className="text-xs text-text-secondary">Nenhuma conversa encontrada</p>
          </div>
        ) : (
          filtered.map((conv) => {
            const statusConfig = STATUS_CONFIG[conv.status];
            const lastMessage = conv.messages[conv.messages.length - 1];
            const bantTotal = conv.bant?.total || 0;
            const isSelected = conv.id === selectedId;

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-3",
                  "border-b border-arkos-border text-left",
                  "transition-all duration-200",
                  isSelected
                    ? "bg-arkos-blue/10 border-l-2 border-l-arkos-blue"
                    : "hover:bg-arkos-surface-2 border-l-2 border-l-transparent"
                )}
              >
                <Avatar name={conv.leadName} size="sm" status="online" />

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-text-primary truncate">
                      {conv.leadName}
                    </p>
                    <span className="text-2xs text-text-muted shrink-0">
                      {formatRelativeTime(conv.updatedAt)}
                    </span>
                  </div>

                  {conv.company && (
                    <p className="text-2xs text-text-muted truncate">{conv.company}</p>
                  )}

                  {lastMessage && (
                    <p className="text-2xs text-text-secondary truncate">
                      {lastMessage.role === "assistant" ? "🤖 " : ""}
                      {lastMessage.content.slice(0, 50)}...
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <Badge variant={statusConfig.variant} size="sm" dot={statusConfig.dot} dotAnimate={statusConfig.dot}>
                      {statusConfig.label}
                    </Badge>
                    {bantTotal > 0 && (
                      <span className={cn("text-2xs font-bold", getBantColor(bantTotal))}>
                        BANT: {bantTotal}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
