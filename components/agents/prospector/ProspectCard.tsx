"use client";

import { Prospect, BuyingSignal } from "@/lib/types/prospector";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Avatar, Badge, Button } from "@/components/ui";
import { FitScoreCard } from "./FitScoreCard";
import {
  Building2, Mail, Phone, Globe,
  MapPin, Users, Bot, Zap, Loader2,
  ChevronDown, ChevronUp, ExternalLink,
  ArrowRight, Copy, Check,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── CONFIGURAÇÕES ───
const SOURCE_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  website_form: { label: "Formulário", emoji: "📝", color: "text-info" },
  chatbot: { label: "Chatbot", emoji: "🤖", color: "text-arkos-gold" },
  whatsapp: { label: "WhatsApp", emoji: "💬", color: "text-success" },
  email_reply: { label: "E-mail", emoji: "📧", color: "text-info" },
  referral: { label: "Indicação", emoji: "🤝", color: "text-arkos-gold" },
  social_media: { label: "Social", emoji: "📱", color: "text-purple-400" },
  event: { label: "Evento", emoji: "🎯", color: "text-warning" },
  prospector_ai: { label: "Prospector IA", emoji: "🔍", color: "text-arkos-blue-light" },
  linkedin: { label: "LinkedIn", emoji: "💼", color: "text-info" },
  cold_list: { label: "Lista Fria", emoji: "📋", color: "text-text-muted" },
  manual: { label: "Manual", emoji: "✍️", color: "text-text-muted" },
};

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "info" | "default"; animate: boolean }> = {
  new: { label: "Novo", variant: "info", animate: true },
  enriching: { label: "Enriquecendo...", variant: "warning", animate: true },
  enriched: { label: "Enriquecido", variant: "info", animate: false },
  scoring: { label: "Calculando Score", variant: "warning", animate: true },
  scored: { label: "Score Pronto", variant: "success", animate: false },
  ready: { label: "Pronto", variant: "success", animate: false },
  contacted: { label: "Contatado", variant: "default", animate: false },
  converted: { label: "Convertido", variant: "success", animate: false },
  discarded: { label: "Descartado", variant: "default", animate: false },
};

const SIGNAL_CONFIG: Record<string, { emoji: string; color: string }> = {
  hiring: { emoji: "👥", color: "text-success" },
  funding: { emoji: "💰", color: "text-arkos-gold" },
  expansion: { emoji: "📈", color: "text-success" },
  pain_mention: { emoji: "🎯", color: "text-danger" },
  competitor_issue: { emoji: "⚔️", color: "text-warning" },
  technology_change: { emoji: "🔧", color: "text-info" },
  event_trigger: { emoji: "🎪", color: "text-purple-400" },
};

const SIZE_LABEL: Record<string, string> = {
  micro: "Micro (1-9)",
  small: "Pequena (10-49)",
  medium: "Média (50-199)",
  large: "Grande (200+)",
  enterprise: "Enterprise (1000+)",
};

interface ProspectCardProps {
  prospect: Prospect;
  onEnrich?: (prospect: Prospect) => void;
  onConvert?: (prospect: Prospect) => void;
  onDiscard?: (prospect: Prospect) => void;
  isEnriching?: boolean;
}

export function ProspectCard({
  prospect,
  onEnrich,
  onConvert,
  onDiscard,
  isEnriching = false,
}: ProspectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const statusCfg = STATUS_CONFIG[prospect.status];
  const sourceCfg = SOURCE_CONFIG[prospect.source];
  const recColor = prospect.fitScore
    ? prospect.fitScore.recommendation === "high_priority" ? "border-success/30"
    : prospect.fitScore.recommendation === "medium_priority" ? "border-warning/30"
    : prospect.fitScore.recommendation === "low_priority" ? "border-info/20"
    : "border-arkos-border"
    : "border-arkos-border";

  const handleCopyMessage = () => {
    if (!prospect.suggestedMessage) return;
    navigator.clipboard.writeText(prospect.suggestedMessage);
    setCopiedMsg(true);
    toast.success("Mensagem copiada!");
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const needsEnrichment = !prospect.fitScore && prospect.status === "new";

  return (
    <div className={cn(
      "rounded-2xl border bg-arkos-surface",
      "transition-all duration-300 hover:shadow-arkos",
      recColor
    )}>

      {/* ─── HEADER ─── */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          {/* Info principal */}
          <div className="flex items-start gap-3 min-w-0">
            <Avatar
              name={
                prospect.contact?.firstName ||
                prospect.rawData.name ||
                "?"
              }
              size="md"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-text-primary truncate">
                {prospect.contact?.firstName || prospect.rawData.name || "Nome não informado"}{" "}
                {prospect.contact?.lastName || ""}
              </p>
              <p className="text-xs text-text-secondary truncate">
                {prospect.contact?.jobTitle || "Cargo não identificado"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Building2 className="h-3 w-3 text-text-muted" />
                <span className="text-xs text-text-muted truncate">
                  {prospect.company?.name || prospect.rawData.company || "Empresa não informada"}
                </span>
              </div>
              {prospect.company?.website && (
                <a 
                  href={prospect.company.website.startsWith("http") ? prospect.company.website : `https://${prospect.company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 mt-0.5 text-xs text-arkos-blue-light hover:underline"
                >
                  <Globe className="h-3 w-3" />
                  {prospect.company.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <Badge
              variant={statusCfg.variant}
              size="sm"
              dot
              dotAnimate={statusCfg.animate}
            >
              {statusCfg.label}
            </Badge>

            <div className={cn("text-2xs font-medium", sourceCfg.color)}>
              {sourceCfg.emoji} {sourceCfg.label}
            </div>
          </div>
        </div>

        {/* Localização + Tamanho + Redes Sociais */}
        <div className="flex flex-wrap items-center gap-3 text-2xs text-text-muted">
          {prospect.company && (
            <>
              {prospect.company.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {prospect.company.city} / {prospect.company.state || "Brasil"}
                </div>
              )}
              {prospect.company.size && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {SIZE_LABEL[prospect.company.size]}
                </div>
              )}
            </>
          )}
          
          {/* Links Externos (Maps, GMB, Redes) */}
          <div className="flex items-center gap-2 border-l border-arkos-border pl-3">
            {prospect.company?.city && (
              <a 
                href={`https://www.google.com/maps/search/${encodeURIComponent(`${prospect.company.name} ${prospect.company.city}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-arkos-blue-light transition-colors"
                title="Ver no Google Maps"
              >
                <MapPin className="h-3 w-3" />
              </a>
            )}
            {prospect.company?.linkedinUrl && (
              <a 
                href={prospect.company.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-arkos-blue-light transition-colors"
                title="LinkedIn da Empresa"
              >
                <Building2 className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* FIT Score compacto */}
        {prospect.fitScore && (
          <FitScoreCard fitScore={prospect.fitScore} compact />
        )}

        {/* Sinais de compra */}
        {prospect.buyingSignals && prospect.buyingSignals.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xs text-text-muted">Sinais:</span>
            {prospect.buyingSignals.map((signal, i) => {
              const sigConfig = SIGNAL_CONFIG[signal.type] || { emoji: "📊", color: "text-text-secondary" };
              return (
                <div
                  key={i}
                  title={signal.description}
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full",
                    "bg-arkos-surface-2 border border-arkos-border text-2xs",
                    sigConfig.color,
                    signal.strength === "strong" && "border-current/30"
                  )}
                >
                  <span>{sigConfig.emoji}</span>
                  <span className="capitalize">{signal.type.replace("_", " ")}</span>
                  {signal.strength === "strong" && (
                    <span className="text-current opacity-60">●</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* AI Summary */}
        {prospect.aiSummary && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-arkos-gold/5 border border-arkos-gold/20">
            <Bot className="h-3.5 w-3.5 text-arkos-gold shrink-0 mt-0.5" />
            <p className="text-xs text-text-secondary leading-relaxed">
              {prospect.aiSummary}
            </p>
          </div>
        )}

        {/* Dados brutos (quando não enriquecido) */}
        {!prospect.fitScore && prospect.rawData.message && (
          <div className="px-3 py-2.5 rounded-xl bg-arkos-surface-2 border border-arkos-border">
            <p className="text-2xs text-text-muted mb-1">Mensagem recebida:</p>
            <p className="text-xs text-text-secondary italic">
              &quot;{prospect.rawData.message}&quot;
            </p>
          </div>
        )}

        {/* Tempo */}
        <p className="text-2xs text-text-muted">
          Recebido {formatRelativeTime(prospect.receivedAt)}
          {prospect.rawData.utmCampaign && ` · Campanha: ${prospect.rawData.utmCampaign}`}
        </p>
      </div>

      {/* ─── SEÇÃO EXPANDIDA ─── */}
      {expanded && prospect.fitScore && (
        <div className="px-4 pb-4 space-y-4 border-t border-arkos-border pt-4">

          {/* FIT Score completo */}
          <FitScoreCard fitScore={prospect.fitScore} />

          {/* Mensagem sugerida */}
          {prospect.suggestedMessage && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-text-secondary">
                  📧 Mensagem Sugerida pela IA
                </p>
                <button
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-arkos-surface-2 text-text-muted hover:text-text-primary transition-all text-2xs"
                >
                  {copiedMsg ? (
                    <Check className="h-3 w-3 text-success" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copiedMsg ? "Copiado!" : "Copiar"}
                </button>
              </div>
              <div className="px-4 py-3 rounded-xl bg-arkos-bg border border-arkos-border">
                <p className="text-xs text-text-secondary leading-relaxed italic">
                  &quot;{prospect.suggestedMessage}&quot;
                </p>
              </div>
            </div>
          )}

          {/* Abordagem sugerida */}
          {prospect.fitScore.suggestedApproach && (
            <div className="px-3 py-2.5 rounded-xl bg-arkos-blue/5 border border-arkos-blue/20">
              <p className="text-2xs font-semibold text-arkos-blue-light mb-1">
                💡 Abordagem Sugerida
              </p>
              <p className="text-xs text-text-secondary leading-relaxed">
                {prospect.fitScore.suggestedApproach}
              </p>
            </div>
          )}

          {/* Dados da empresa */}
          {prospect.company?.technologies && (
            <div>
              <p className="text-2xs font-semibold text-text-muted mb-2">
                Tecnologias que usa:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {prospect.company.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 rounded-full bg-arkos-surface-3 border border-arkos-border text-2xs text-text-secondary"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── FOOTER / AÇÕES ─── */}
      <div className="px-4 py-3 border-t border-arkos-border flex items-center justify-between gap-2">

        {/* Toggle expand */}
        {prospect.fitScore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-2xs text-text-muted hover:text-text-secondary transition-colors"
          >
            {expanded ? (
              <><ChevronUp className="h-3.5 w-3.5" /> Menos</>
            ) : (
              <><ChevronDown className="h-3.5 w-3.5" /> Ver análise completa</>
            )}
          </button>
        )}

        {/* Ações */}
        <div className="flex items-center gap-2 ml-auto">
          {needsEnrichment && (
            <Button
              variant="secondary"
              size="xs"
              loading={isEnriching}
              onClick={() => onEnrich?.(prospect)}
              icon={isEnriching ? undefined : <Zap className="h-3 w-3" />}
            >
              {isEnriching ? "Analisando..." : "Analisar com IA"}
            </Button>
          )}

          {/* Ação de Contato WhatsApp */}
          {(prospect.contact?.phone || prospect.rawData.phone) && (
            <a
              href={`https://web.whatsapp.com/send?phone=${(prospect.contact?.phone || prospect.rawData.phone)?.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="secondary"
                size="xs"
                className="text-success hover:bg-success/10"
                icon={<Phone className="h-3 w-3" />}
              >
                WhatsApp
              </Button>
            </a>
          )}

          {prospect.fitScore?.recommendation !== "discard" && prospect.status !== "converted" && (
            <Button
              variant="primary"
              size="xs"
              loading={isConverting}
              onClick={async () => {
                if (!onConvert) return;
                setIsConverting(true);
                try {
                  await (onConvert(prospect) as any);
                } finally {
                  setIsConverting(false);
                }
              }}
              icon={isConverting ? undefined : <ArrowRight className="h-3 w-3" />}
            >
              Criar Negócio
            </Button>
          )}

          {prospect.status === "converted" && (
            <Badge variant="success">No Pipeline</Badge>
          )}

          {prospect.fitScore?.recommendation === "discard" && prospect.status !== "discarded" && (
            <Button
              variant="danger"
              size="xs"
              onClick={() => onDiscard?.(prospect)}
            >
              Descartar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
