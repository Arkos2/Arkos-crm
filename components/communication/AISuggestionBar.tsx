"use client";

import { useState } from "react";
import { AISuggestedReply } from "@/lib/types/communication";
import { cn } from "@/lib/utils";
import { Bot, Check, X, Edit3, Loader2, ChevronDown, Sparkles } from "lucide-react";
import { Button, Badge } from "@/components/ui";

interface AISuggestionBarProps {
  suggestion: AISuggestedReply | null;
  isLoading: boolean;
  onAccept: (content: string) => void;
  onEdit: (content: string) => void;
  onDismiss: () => void;
  onRegenerate: () => void;
}

export function AISuggestionBar({
  suggestion,
  isLoading,
  onAccept,
  onEdit,
  onDismiss,
  onRegenerate,
}: AISuggestionBarProps) {
  const [showReasoning, setShowReasoning] = useState(false);

  if (!isLoading && !suggestion) return null;

  return (
    <div className="border-t border-arkos-gold/20 bg-arkos-gold/5">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-arkos-gold/10">
        <div className="flex items-center gap-2">
          <Bot className="h-3.5 w-3.5 text-arkos-gold" />
          <span className="text-2xs font-semibold text-arkos-gold">
            Sugestão do Agente IA
          </span>
          {suggestion && (
            <>
              <Badge variant="gold" size="sm">
                {suggestion.confidence}% confiança
              </Badge>
              <span className="text-2xs text-text-muted capitalize">
                · Tom {suggestion.tone}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="p-1 rounded-lg hover:bg-arkos-gold/10 text-text-muted hover:text-arkos-gold transition-all disabled:opacity-50"
            title="Regenerar"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-all"
            title="Dispensar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      {isLoading ? (
        <div className="flex items-center gap-2 px-4 py-3">
          <Loader2 className="h-3.5 w-3.5 text-arkos-gold animate-spin shrink-0" />
          <span className="text-xs text-text-muted">
            Analisando conversa e gerando sugestão...
          </span>
        </div>
      ) : suggestion ? (
        <div className="px-4 py-3 space-y-3">
          {/* Texto sugerido */}
          <p className="text-sm text-text-primary leading-relaxed bg-arkos-surface-2 border border-arkos-border rounded-xl px-3 py-2.5 italic">
            &quot;{suggestion.content}&quot;
          </p>

          {/* Reasoning (toggle) */}
          {suggestion.reasoning && (
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="flex items-center gap-1.5 text-2xs text-text-muted hover:text-text-secondary transition-colors"
            >
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform",
                  showReasoning && "rotate-180"
                )}
              />
              {showReasoning ? "Ocultar" : "Por que essa resposta?"}
            </button>
          )}

          {showReasoning && suggestion.reasoning && (
            <div className="px-3 py-2 rounded-lg bg-arkos-surface-2 border border-arkos-border">
              <p className="text-2xs text-text-secondary leading-relaxed">
                {suggestion.reasoning}
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center gap-2">
            <Button
              variant="gold"
              size="xs"
              icon={<Check className="h-3 w-3" />}
              onClick={() => onAccept(suggestion.content)}
            >
              Usar essa resposta
            </Button>
            <Button
              variant="secondary"
              size="xs"
              icon={<Edit3 className="h-3 w-3" />}
              onClick={() => onEdit(suggestion.content)}
            >
              Editar antes de enviar
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
