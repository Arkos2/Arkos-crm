"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Deal } from "@/lib/types/deal";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";
import { Avatar, Badge } from "@/components/ui";
import { BANTMeterCompact } from "./BANTMeter";
import { motion } from "framer-motion";
import {
  Bot,
  Calendar,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  AlertTriangle,
  Flame,
  CheckSquare,
  GripVertical,
} from "lucide-react";

interface DealCardProps {
  deal: Deal;
  onClick?: (deal: Deal) => void;
  isDragging?: boolean;
}

// Temperatura do lead
const TEMP_CONFIG = {
  hot: { icon: "🔥", label: "Quente", color: "text-danger", badge: "danger" as const },
  warm: { icon: "⚡", label: "Morno", color: "text-warning", badge: "warning" as const },
  cold: { icon: "❄️", label: "Frio", color: "text-info", badge: "info" as const },
  rotting: { icon: "⚠️", label: "Parado", color: "text-danger", badge: "danger" as const },
};

// Ícone por tipo de sugestão IA
const AI_TYPE_COLOR = {
  action: "text-arkos-blue-light",
  insight: "text-arkos-gold",
  warning: "text-danger",
  opportunity: "text-success",
};

export function DealCard({ deal, onClick, isDragging }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const tempConfig = TEMP_CONFIG[deal.temperature];
  const primarySuggestion = deal.aiSuggestions?.[0];
  const pendingTasks = deal.tasks?.filter((t) => !t.isCompleted).length || 0;
  const isOverdue =
    deal.expectedCloseDate &&
    new Date(deal.expectedCloseDate) < new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative",
        (isDragging || isSortableDragging) && "opacity-40 z-50 scale-105 shadow-xl transition-transform"
      )}
    >
      <div
        onClick={() => onClick?.(deal)}
        className={cn(
          // Base
          "relative rounded-xl border cursor-pointer",
          "bg-arkos-surface transition-all duration-200",
          "overflow-hidden",
          // Hover
          "hover:border-arkos-blue/40 hover:bg-arkos-surface-2",
          "hover:-translate-y-0.5 hover:shadow-card-hover",
          // Rotting
          deal.isRotting
            ? "border-danger/40 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
            : "border-arkos-border",
          // Hot
          deal.temperature === "hot" && !deal.isRotting &&
            "border-danger/20"
        )}
      >
        {/* Barra lateral por temperatura */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl",
            deal.temperature === "hot" && "bg-danger",
            deal.temperature === "warm" && "bg-warning",
            deal.temperature === "cold" && "bg-info",
            deal.isRotting && "bg-danger animate-pulse"
          )}
        />

        <div className="p-3 pl-4 space-y-3">

          {/* ─── HEADER ─── */}
          <div className="flex items-start gap-2">
            {/* Drag handle */}
            <button
              {...attributes}
              {...listeners}
              className="mt-0.5 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-text-muted hover:text-text-secondary"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-3 w-3" />
            </button>

            <div className="flex-1 min-w-0">
              {/* Empresa */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-bold text-text-primary truncate">
                  {deal.organization?.name || "Sem Empresa"}
                </span>
                {deal.organization?.industry && (
                  <Badge variant="default" size="sm">
                    {deal.organization.industry}
                  </Badge>
                )}
              </div>

              {/* Título */}
              <p className="text-2xs text-text-secondary truncate">
                {deal.title}
              </p>
            </div>

            {/* Valor */}
            <div className="shrink-0 text-right">
              <p className="text-sm font-bold text-text-primary">
                {formatCurrency(deal.value)}
              </p>
              {isOverdue && (
                <span className="text-2xs text-danger">Atrasado</span>
              )}
            </div>
          </div>

          {/* ─── CONTATO + OWNER ─── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Avatar name={`${deal.contact?.firstName || ""} ${deal.contact?.lastName || ""}`} size="xs" />
              <div>
                <p className="text-2xs font-medium text-text-secondary leading-none">
                  {deal.contact?.firstName || "Contato"} {deal.contact?.lastName || "Indefinido"}
                </p>
                <p className="text-2xs text-text-muted leading-none mt-0.5">
                  {deal.contact?.jobTitle || "Sem cargo"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Avatar name={deal.ownerName || "Agente"} size="xs" />
              <span className="text-2xs text-text-muted">
                {deal.ownerName?.split(" ")[0] || "Agente"}
              </span>
            </div>
          </div>

          {/* ─── BANT SCORE ─── */}
          <div className="flex items-center justify-between">
            <BANTMeterCompact bant={deal.bant} />
          </div>

          {/* ─── TEMPERATURA + STATUS ─── */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Temperatura */}
            <div className="flex items-center gap-1">
              <span className="text-sm">{tempConfig.icon}</span>
              <span className={cn("text-2xs font-medium", tempConfig.color)}>
                {deal.isRotting ? `Parado ${deal.rottingDays}d` : tempConfig.label}
              </span>
            </div>

            {/* Data prevista */}
            {deal.expectedCloseDate && (
              <div className="flex items-center gap-1 text-2xs text-text-muted">
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(deal.expectedCloseDate).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </span>
              </div>
            )}

            {/* Tasks pendentes */}
            {pendingTasks > 0 && (
              <div className="flex items-center gap-1 text-2xs text-text-muted">
                <CheckSquare className="h-3 w-3" />
                <span>{pendingTasks}</span>
              </div>
            )}

            {/* Docs */}
            {(deal.documents?.length || 0) > 0 && (
              <div className="flex items-center gap-1 text-2xs text-text-muted">
                <FileText className="h-3 w-3" />
                <span>{deal.documents.length}</span>
              </div>
            )}

            {/* Última atividade */}
            {deal.lastActivityAt && (
              <div className="flex items-center gap-1 text-2xs text-text-muted ml-auto">
                <Clock className="h-3 w-3" />
                <span>{formatRelativeTime(deal.lastActivityAt)}</span>
              </div>
            )}
          </div>

          {/* ─── SUGESTÃO IA ─── */}
          {primarySuggestion && (
            <div
              className={cn(
                "rounded-lg p-2.5 border",
                primarySuggestion.type === "warning"
                  ? "bg-danger/5 border-danger/20"
                  : primarySuggestion.type === "opportunity"
                  ? "bg-success/5 border-success/20"
                  : primarySuggestion.type === "insight"
                  ? "bg-arkos-gold/5 border-arkos-gold/20"
                  : "bg-arkos-blue/5 border-arkos-blue/20"
              )}
            >
              <div className="flex items-start gap-1.5">
                <Bot
                  className={cn(
                    "h-3 w-3 shrink-0 mt-0.5",
                    AI_TYPE_COLOR[primarySuggestion.type]
                  )}
                />
                <p className="text-2xs text-text-secondary leading-relaxed line-clamp-2">
                  {primarySuggestion.text}
                </p>
              </div>
            </div>
          )}

          {/* ─── ROTTING ALERT ─── */}
          {deal.isRotting && (
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-danger/10 border border-danger/20">
              <AlertTriangle className="h-3 w-3 text-danger shrink-0" />
              <span className="text-2xs text-danger font-medium">
                Sem atividade há {deal.rottingDays} dias
              </span>
            </div>
          )}

          {/* ─── QUICK ACTIONS ─── */}
          <div
            className="flex items-center gap-1 pt-1 border-t border-arkos-border opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { icon: Phone, label: "Ligar", color: "hover:text-success hover:bg-success/10" },
              { icon: Mail, label: "E-mail", color: "hover:text-info hover:bg-info/10" },
              { icon: MessageSquare, label: "WhatsApp", color: "hover:text-success hover:bg-success/10" },
              { icon: Calendar, label: "Agendar", color: "hover:text-arkos-gold hover:bg-arkos-gold/10" },
              { icon: FileText, label: "Proposta", color: "hover:text-arkos-blue-light hover:bg-arkos-blue/10" },
            ].map(({ icon: Icon, label, color }) => (
              <button
                key={label}
                title={label}
                className={cn(
                  "flex-1 flex items-center justify-center p-1.5 rounded-lg",
                  "text-text-muted transition-all duration-150",
                  color
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Ghost card durante drag
export function DealCardGhost({ deal }: { deal: Deal }) {
  return (
    <div className="rounded-xl border border-arkos-blue/40 bg-arkos-blue/5 p-3 opacity-60">
      <p className="text-xs font-bold text-text-primary">
        {deal.organization?.name || "Sem Empresa"}
      </p>
      <p className="text-sm font-bold text-arkos-blue-light mt-1">
        {formatCurrency(deal.value)}
      </p>
    </div>
  );
}
