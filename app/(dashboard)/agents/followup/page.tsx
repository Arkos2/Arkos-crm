"use client";

import { useState } from "react";
import { Sequence, Enrollment } from "@/lib/types/followup";
import { SequenceCard } from "@/components/followup/SequenceCard";
import { EnrollmentTimeline } from "@/components/followup/EnrollmentTimeline";
import {
  MOCK_SEQUENCES,
  MOCK_ENROLLMENTS,
  MOCK_FOLLOWUP_STATS,
} from "@/lib/mock/followup";
import { Card, Badge, Button, KPICard, EmptyState } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  RefreshCw, ArrowLeft, Bot, Plus,
  TrendingUp, Users, Send, Reply,
  LayoutGrid, List, Filter, Zap,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type ActiveTab = "sequences" | "enrollments";

export default function FollowUpPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("sequences");
  const [sequences, setSequences] = useState<Sequence[]>(MOCK_SEQUENCES);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(MOCK_ENROLLMENTS);
  const [enrollmentFilter, setEnrollmentFilter] = useState<
    "all" | "active" | "replied" | "completed"
  >("all");

  const stats = MOCK_FOLLOWUP_STATS;

  const handleToggleSequence = (id: string) => {
    setSequences((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, isActive: !s.isActive } : s
      )
    );
    const seq = sequences.find((s) => s.id === id);
    toast.success(
      seq?.isActive
        ? `Sequência "${seq?.name}" pausada`
        : `Sequência "${seq?.name}" ativada`
    );
  };

  const handlePauseEnrollment = (id: string) => {
    setEnrollments((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: e.status === "active" ? "paused" : "active",
            }
          : e
      )
    );
  };

  const handleConvertEnrollment = (id: string) => {
    const enr = enrollments.find((e) => e.id === id);
    toast.success(`Negócio criado para ${enr?.leadName}!`, {
      action: {
        label: "Ver Pipeline",
        onClick: () => (window.location.href = "/pipeline"),
      },
    });
    setEnrollments((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: "converted" } : e
      )
    );
  };

  const filteredEnrollments = enrollments.filter((e) => {
    if (enrollmentFilter === "active") return e.status === "active";
    if (enrollmentFilter === "replied") return e.status === "replied";
    if (enrollmentFilter === "completed")
      return e.status === "completed" || e.status === "converted";
    return true;
  });

  const repliedCount = enrollments.filter((e) => e.status === "replied").length;

  return (
    <div className="space-y-5">

      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/agents">
            <button className="p-2 rounded-xl hover:bg-arkos-surface-2 text-text-muted transition-all">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div className="p-2 rounded-xl bg-warning/10 border border-warning/20">
            <RefreshCw className="h-5 w-5 text-warning" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-text-primary">
                Agente Follow-Up
              </h1>
              <Badge variant="success" dot dotAnimate>Ativo</Badge>
              {repliedCount > 0 && (
                <Badge variant="success">
                  🎯 {repliedCount} responderam!
                </Badge>
              )}
            </div>
            <p className="text-xs text-text-muted">
              Sequências automáticas multi-canal
            </p>
          </div>
        </div>

        <Button
          variant="gold"
          size="sm"
          icon={<Plus className="h-3.5 w-3.5" />}
        >
          Nova Sequência
        </Button>
      </div>

      {/* ─── KPIs ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Sequências Ativas"
          value={stats.activeSequences}
          valueFormat="number"
          icon={<Zap className="h-4 w-4" />}
          description="de 3 criadas"
        />
        <KPICard
          title="Em Andamento"
          value={stats.activeEnrollments}
          valueFormat="number"
          trend={12}
          icon={<Users className="h-4 w-4" />}
          description="leads nas sequências"
        />
        <KPICard
          title="Taxa de Resposta"
          value={stats.avgReplyRate}
          valueFormat="percent"
          trend={8}
          icon={<Reply className="h-4 w-4" />}
        />
        <KPICard
          title="Passos Hoje"
          value={stats.stepsSentToday}
          valueFormat="number"
          icon={<Send className="h-4 w-4" />}
          description={`${stats.repliesReceivedToday} respostas`}
        />
      </div>

      {/* ─── ALERTA DE RESPOSTAS ─── */}
      {repliedCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-success/30 bg-success/5">
          <Bot className="h-4 w-4 text-success shrink-0" />
          <p className="text-sm text-text-secondary flex-1">
            <strong className="text-text-primary">
              🎯 {repliedCount} lead{repliedCount > 1 ? "s" : ""} respondeu
            </strong>{" "}
            às sequências. Contato imediato aumenta a taxa de fechamento em 70%.
          </p>
          <Button
            variant="secondary"
            size="xs"
            onClick={() => setEnrollmentFilter("replied")}
          >
            Ver Agora
          </Button>
        </div>
      )}

      {/* ─── TABS ─── */}
      <div className="flex border-b border-arkos-border">
        {[
          { id: "sequences", label: "Sequências", count: sequences.length },
          { id: "enrollments", label: "Leads nas Sequências", count: enrollments.length },
        ].map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as ActiveTab)}
            className={cn(
              "flex items-center gap-2 px-5 py-3 text-sm font-medium",
              "border-b-2 -mb-px transition-all",
              activeTab === id
                ? "border-arkos-gold text-text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            {label}
            <span className={cn(
              "px-2 py-0.5 rounded-full text-2xs font-bold",
              activeTab === id
                ? "bg-arkos-gold/10 text-arkos-gold"
                : "bg-arkos-surface-3 text-text-muted"
            )}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ─── SEQUÊNCIAS ─── */}
      {activeTab === "sequences" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {sequences.map((sequence) => (
              <SequenceCard
                key={sequence.id}
                sequence={sequence}
                onToggle={handleToggleSequence}
                onEdit={(id) => toast.info(`Editar sequência ${id}`)}
                onClick={(s) => toast.info(`Detalhes: ${s.name}`)}
              />
            ))}

            {/* Card de adicionar */}
            <button
              onClick={() => toast.info("Criar nova sequência")}
              className={cn(
                "flex flex-col items-center justify-center gap-3 p-8 rounded-2xl",
                "border-2 border-dashed border-arkos-border",
                "hover:border-arkos-blue/40 hover:bg-arkos-blue/5",
                "transition-all duration-200 text-text-muted hover:text-arkos-blue-light",
                "min-h-[200px]"
              )}
            >
              <Plus className="h-8 w-8" />
              <div className="text-center">
                <p className="text-sm font-semibold">Nova Sequência</p>
                <p className="text-xs opacity-70 mt-1">
                  Criar do zero ou usar template
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ─── ENROLLMENTS ─── */}
      {activeTab === "enrollments" && (
        <div className="space-y-4">

          {/* Filtros */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {[
              { id: "all", label: "Todos", count: enrollments.length },
              { id: "active", label: "⚡ Ativos", count: enrollments.filter((e) => e.status === "active").length },
              { id: "replied", label: "🎯 Responderam", count: repliedCount },
              { id: "completed", label: "✅ Concluídos", count: enrollments.filter((e) => ["completed", "converted"].includes(e.status)).length },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setEnrollmentFilter(f.id as typeof enrollmentFilter)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium",
                  "transition-all whitespace-nowrap shrink-0",
                  enrollmentFilter === f.id
                    ? "bg-arkos-blue/10 border-arkos-blue/40 text-arkos-blue-light"
                    : "border-arkos-border text-text-muted hover:border-arkos-border-2"
                )}
              >
                {f.label}
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-2xs font-bold",
                  enrollmentFilter === f.id
                    ? "bg-arkos-blue/20 text-arkos-blue-light"
                    : "bg-arkos-surface-3 text-text-muted"
                )}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {filteredEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredEnrollments.map((enrollment) => (
                <EnrollmentTimeline
                  key={enrollment.id}
                  enrollment={enrollment}
                  onPause={handlePauseEnrollment}
                  onConvert={handleConvertEnrollment}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<RefreshCw className="h-8 w-8" />}
              title="Nenhum lead nessa categoria"
              description="Cadastre leads nas sequências para acompanhar aqui"
              size="md"
            />
          )}
        </div>
      )}
    </div>
  );
}
