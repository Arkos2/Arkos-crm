"use client";

import { useState, useCallback } from "react";
import { Prospect } from "@/lib/types/prospector";
import { ProspectCard } from "@/components/agents/prospector/ProspectCard";
import { OutboundSearch } from "@/components/agents/prospector/OutboundSearch";
import { Card, Badge, Button, KPICard, EmptyState } from "@/components/ui";
import { cn, formatPercent } from "@/lib/utils";
import {
  Search, ArrowLeft, Bot, TrendingUp,
  Inbox, Send, Zap, Users,
  RefreshCw, Filter, Bell,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { findOrCreateOrganization } from "@/lib/supabase/services/organizations";
import { createContact } from "@/lib/supabase/services/contacts";
import { createDeal } from "@/lib/supabase/services/deals";
import { getDefaultPipeline } from "@/lib/supabase/services/pipelines";

type ActiveTab = "inbound" | "outbound";

const TAB_CONFIG = {
  inbound: {
    label: "Inbound",
    emoji: "📥",
    desc: "Leads que vieram até você",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
  },
  outbound: {
    label: "Outbound",
    emoji: "📤",
    desc: "Você vai até o lead",
    color: "text-arkos-blue-light",
    bg: "bg-arkos-blue/10",
    border: "border-arkos-blue/20",
  },
};

export default function ProspectorPage() {
  const { user, supabaseUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>("inbound");
  const [inboundProspects, setInboundProspects] = useState<Prospect[]>([]);
  const [enrichingId, setEnrichingId] = useState<string | null>(null);
  const [inboundFilter, setInboundFilter] = useState<"all" | "new" | "scored" | "high">("all");

  const stats = {
    inbound: {
      today: 0,
      week: 0,
      avgFitScore: 0,
      conversionRate: 0,
      topSource: "Nenhuma",
    },
    outbound: {
      searchesToday: 0,
      prospectsFound: 0,
      avgFitScore: 0,
    },
  };

  // ─── ENRIQUECER INBOUND ───
  const handleEnrich = useCallback(async (prospect: Prospect) => {
    setEnrichingId(prospect.id);
    setInboundProspects((prev) =>
      prev.map((p) =>
        p.id === prospect.id ? { ...p, status: "enriching" } : p
      )
    );

    try {
      const savedSettings = localStorage.getItem("arkos_ai_settings");
      const aiConfig = savedSettings ? JSON.parse(savedSettings) : {};

      const res = await fetch("/api/agents/prospector/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prospect,
          config: {
            model: aiConfig.model,
            temperature: aiConfig.temperature
          }
        }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      setInboundProspects((prev) =>
        prev.map((p) =>
          p.id === prospect.id
            ? {
                ...p,
                status: "scored",
                company: data.enrichedData?.company
                  ? { ...p.company, ...data.enrichedData.company }
                  : p.company,
                contact: data.enrichedData?.contact
                  ? { ...p.contact, ...data.enrichedData.contact }
                  : p.contact,
                fitScore: data.fitScore,
                buyingSignals: data.buyingSignals || [],
                aiSummary: data.aiSummary,
                suggestedMessage: data.suggestedMessage,
                enrichedAt: data.enrichedAt,
                scoredAt: data.enrichedAt,
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );

      const rec = data.fitScore?.recommendation;
      if (rec === "high_priority") {
        toast.success("🔥 Lead de alta prioridade!", {
          description: `FIT Score: ${data.fitScore?.total}/100 — Contate em até 1h!`,
        });
      } else if (rec === "discard") {
        toast.info("Lead fora do ICP", {
          description: "Score baixo — considere descartar.",
        });
      } else {
        toast.success(`Lead analisado — Score: ${data.fitScore?.total}/100`);
      }
    } catch {
      toast.error("Erro ao analisar lead. Verifique a API key.");
      setInboundProspects((prev) =>
        prev.map((p) =>
          p.id === prospect.id ? { ...p, status: "new" } : p
        )
      );
    } finally {
      setEnrichingId(null);
    }
  }, []);

  // ─── CONVERTER PARA PIPELINE ───
  const handleConvert = useCallback(async (prospect: Prospect) => {
    const activeUser = user || supabaseUser;

    if (!activeUser) {
      toast.error("Você precisa estar logado para converter leads.");
      return;
    }

    const name =
      prospect.contact?.firstName ||
      prospect.rawData.name ||
      "Lead";

    const companyName =
      prospect.company?.name ||
      prospect.rawData.company ||
      "Empresa";

    const toastId = toast.loading(`Convertendo ${companyName}...`);

    try {
      // 1. Pipeline Padrão
      const pipeline = await getDefaultPipeline();
      if (!pipeline) throw new Error("Nenhum pipeline encontrado.");

      // 2. Criar/Achar Organização
      const org = await findOrCreateOrganization({
        name: companyName,
        industry: prospect.company?.industry,
        size: prospect.company?.size,
        website: prospect.company?.website,
      });

      // 3. Criar Contato
      const contact = await createContact({
        firstName: name,
        lastName: prospect.contact?.lastName || "",
        email: prospect.contact?.email || prospect.rawData.email,
        phone: prospect.contact?.phone || prospect.rawData.phone,
        jobTitle: prospect.contact?.jobTitle,
        organizationId: org.id,
        isDecisionMaker: prospect.contact?.isDecisionMaker,
        source: prospect.source,
      });

      // 4. Criar Negócio (Deal)
      await createDeal({
        title: `Negócio: ${companyName}`,
        pipelineId: pipeline.id,
        organizationId: org.id,
        contactId: contact.id,
        ownerId: activeUser.id,
        value: 0,
      });

      toast.success(`Negócio criado: ${companyName}`, {
        id: toastId,
        description: `${name} foi adicionado ao Pipeline!`,
        action: {
          label: "Ver Pipeline",
          onClick: () => window.location.href = "/pipeline",
        },
      });

      setInboundProspects((prev) =>
        prev.map((p) =>
          p.id === prospect.id ? { ...p, status: "converted" } : p
        )
      );
    } catch (err: any) {
      console.error("Erro ao converter:", err);
      toast.error("Erro ao converter prospecto", {
        id: toastId,
        description: err.message || "Verifique sua conexão.",
      });
    }
  }, [user, supabaseUser]);

  // ─── DESCARTAR ───
  const handleDiscard = useCallback((prospect: Prospect) => {
    setInboundProspects((prev) =>
      prev.map((p) =>
        p.id === prospect.id ? { ...p, status: "discarded" } : p
      )
    );
    toast.info("Lead descartado");
  }, []);

  // ─── FILTRAR INBOUND ───
  const filteredInbound = inboundProspects.filter((p) => {
    if (p.status === "discarded" || p.status === "converted") return false;
    if (inboundFilter === "new") return p.status === "new";
    if (inboundFilter === "scored") return p.fitScore !== undefined;
    if (inboundFilter === "high") return p.fitScore?.recommendation === "high_priority";
    return true;
  });

  const newCount = inboundProspects.filter(
    (p) => p.status === "new"
  ).length;

  const highCount = inboundProspects.filter(
    (p) => p.fitScore?.recommendation === "high_priority"
  ).length;

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
          <div className="p-2 rounded-xl bg-info/10 border border-info/20">
            <Search className="h-5 w-5 text-info" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-text-primary">
                Agente Prospector
              </h1>
              <Badge variant="success" dot dotAnimate>Ativo</Badge>
              {newCount > 0 && (
                <Badge variant="info" dot dotAnimate>
                  {newCount} novo{newCount > 1 ? "s" : ""}
                </Badge>
              )}
              {highCount > 0 && (
                <Badge variant="danger">
                  🔥 {highCount} urgente{highCount > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <p className="text-xs text-text-muted">
              Inbound + Outbound com análise de ICP via IA
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={<Bell className="h-3.5 w-3.5" />}
        >
          Alertas
        </Button>
      </div>

      {/* ─── KPIs ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Inbound Hoje"
          value={stats.inbound.today}
          valueFormat="number"
          trend={18}
          description="leads chegaram"
          icon={<Inbox className="h-4 w-4" />}
        />
        <KPICard
          title="FIT Score Médio"
          value={stats.inbound.avgFitScore}
          valueFormat="number"
          suffix="/100"
          trend={5}
          icon={<Zap className="h-4 w-4" />}
        />
        <KPICard
          title="Buscas Outbound"
          value={stats.outbound.searchesToday}
          valueFormat="number"
          description={`${stats.outbound.prospectsFound} empresas encontradas`}
          icon={<Send className="h-4 w-4" />}
        />
        <KPICard
          title="Taxa de Conversão"
          value={stats.inbound.conversionRate}
          valueFormat="percent"
          trend={8}
          description="prospect → pipeline"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* ─── TABS INBOUND / OUTBOUND ─── */}
      <div className="grid grid-cols-2 gap-3">
        {(["inbound", "outbound"] as const).map((tab) => {
          const config = TAB_CONFIG[tab];
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative flex items-center gap-4 p-4 rounded-2xl border",
                "transition-all duration-300 text-left",
                isActive
                  ? cn(config.bg, config.border, "shadow-arkos")
                  : "bg-arkos-surface border-arkos-border hover:border-arkos-border-2"
              )}
            >
              {/* Ícone grande */}
              <div className={cn(
                "text-4xl select-none transition-transform duration-200",
                isActive && "scale-110"
              )}>
                {config.emoji}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn(
                    "text-base font-bold",
                    isActive ? config.color : "text-text-primary"
                  )}>
                    {config.label}
                  </p>
                  {isActive && (
                    <Badge
                      variant={tab === "inbound" ? "success" : "info"}
                      size="sm"
                      dot
                    >
                      Ativo
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5">{config.desc}</p>
                <div className="flex items-center gap-3 mt-2">
                  {tab === "inbound" ? (
                    <>
                      <span className="text-2xs text-text-muted">
                        <strong className="text-text-secondary">{stats.inbound.week}</strong> esta semana
                      </span>
                      <span className="text-2xs text-text-muted">
                        Fonte top: <strong className="text-text-secondary">{stats.inbound.topSource}</strong>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xs text-text-muted">
                        <strong className="text-text-secondary">{stats.outbound.prospectsFound}</strong> encontrados
                      </span>
                      <span className="text-2xs text-text-muted">
                        Score médio: <strong className="text-text-secondary">{stats.outbound.avgFitScore}</strong>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Indicador ativo */}
              {isActive && (
                <div className={cn(
                  "absolute right-4 top-4 w-2 h-2 rounded-full",
                  tab === "inbound" ? "bg-success" : "bg-arkos-blue-light"
                )} />
              )}
            </button>
          );
        })}
      </div>

      {/* ─── CONTEÚDO: INBOUND ─── */}
      {activeTab === "inbound" && (
        <div className="space-y-4">

          {/* Filtros */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {[
                { id: "all", label: "Todos", count: filteredInbound.length + inboundProspects.filter(p => p.status === "new" && inboundFilter !== "all").length },
                { id: "new", label: "🆕 Novos", count: newCount },
                { id: "scored", label: "⚡ Analisados", count: inboundProspects.filter(p => p.fitScore).length },
                { id: "high", label: "🔥 Urgentes", count: highCount },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setInboundFilter(f.id as typeof inboundFilter)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all",
                    inboundFilter === f.id
                      ? "bg-arkos-blue/10 border-arkos-blue/40 text-arkos-blue-light"
                      : "border-arkos-border text-text-muted hover:border-arkos-border-2"
                  )}
                >
                  {f.label}
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-full text-2xs font-bold",
                    inboundFilter === f.id
                      ? "bg-arkos-blue/20 text-arkos-blue-light"
                      : "bg-arkos-surface-3 text-text-muted"
                  )}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            <Button
              variant="secondary"
              size="xs"
              icon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Atualizar
            </Button>
          </div>

          {/* Alerta: novos sem análise */}
          {newCount > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-warning/5 border border-warning/30">
              <Bot className="h-4 w-4 text-warning shrink-0" />
              <p className="text-sm text-text-secondary flex-1">
                <strong className="text-text-primary">{newCount} lead{newCount > 1 ? "s" : ""}</strong>{" "}
                aguardando análise do Agente IA. Clique em &quot;Analisar com IA&quot; em cada card.
              </p>
              <Button
                variant="secondary"
                size="xs"
                onClick={() => {
                  const newOnes = inboundProspects.filter((p) => p.status === "new");
                  if (newOnes[0]) handleEnrich(newOnes[0]);
                }}
              >
                Analisar Todos
              </Button>
            </div>
          )}

          {/* Grid de cards */}
          {filteredInbound.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredInbound
                .sort((a, b) => {
                  const scoreA = a.fitScore?.total || -1;
                  const scoreB = b.fitScore?.total || -1;
                  return scoreB - scoreA;
                })
                .map((prospect) => (
                  <ProspectCard
                    key={prospect.id}
                    prospect={prospect}
                    onEnrich={handleEnrich}
                    onConvert={handleConvert}
                    onDiscard={handleDiscard}
                    isEnriching={enrichingId === prospect.id}
                  />
                ))}
            </div>
          ) : (
            <EmptyState
              icon={<Inbox className="h-8 w-8" />}
              title="Nenhum lead inbound"
              description="Quando leads chegarem pelo site, chatbot ou formulários, aparecerão aqui."
              size="md"
            />
          )}
        </div>
      )}

      {/* ─── CONTEÚDO: OUTBOUND ─── */}
      {activeTab === "outbound" && (
        <OutboundSearch onConvert={handleConvert} />
      )}

    </div>
  );
}
