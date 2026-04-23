"use client";

import { useState, useCallback } from "react";
import { SellerPerformance, CoachTip } from "@/lib/types/coach";
import { MOCK_SELLERS, MOCK_PLAYBOOKS } from "@/lib/mock/coach";
import { SellerScoreCard } from "@/components/agents/coach/SellerScoreCard";
import { CoachTipCard } from "@/components/agents/coach/CoachTipCard";
import { PeerComparisonChart } from "@/components/agents/coach/PeerComparisonChart";
import { PlaybookCard } from "@/components/agents/coach/PlaybookCard";
import { Card, Badge, Button, KPICard, ProgressBar, Avatar } from "@/components/ui";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Target, ArrowLeft, Bot, RefreshCw,
  Users, TrendingUp, Zap, Star,
  CheckSquare, AlertCircle, BarChart3,
  BookOpen, Trophy, Clock,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type ActiveTab =
  | "overview"
  | "tips"
  | "comparison"
  | "patterns"
  | "activities"
  | "playbooks";

const TABS: Array<{
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
}> = [
  { id: "overview", label: "Visão Geral", icon: BarChart3 },
  { id: "tips", label: "Tips da IA", icon: Bot },
  { id: "comparison", label: "vs Equipe", icon: Users },
  { id: "patterns", label: "Padrões", icon: TrendingUp },
  { id: "activities", label: "Atividades", icon: CheckSquare },
  { id: "playbooks", label: "Playbooks", icon: BookOpen },
];

export default function CoachPage() {
  const [sellers, setSellers] = useState<SellerPerformance[]>(MOCK_SELLERS);
  const [selectedId, setSelectedId] = useState<string>(MOCK_SELLERS[0].id);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedSeller = sellers.find((s) => s.id === selectedId)!;

  // Gerar novos tips com Claude
  const handleGenerateTips = useCallback(async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/agents/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seller: selectedSeller }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      if (data.tips?.length > 0) {
        setSellers((prev) =>
          prev.map((s) =>
            s.id === selectedId
              ? { ...s, tips: [...data.tips, ...s.tips] }
              : s
          )
        );
        toast.success(
          `${data.tips.length} novos tips gerados para ${selectedSeller.name}!`
        );
        setActiveTab("tips");
      }
    } catch {
      toast.error("Erro ao gerar tips. Verifique a API key.");
    } finally {
      setIsGenerating(false);
    }
  }, [selectedSeller, selectedId]);

  const handleDismissTip = (tipId: string) => {
    setSellers((prev) =>
      prev.map((s) =>
        s.id === selectedId
          ? {
              ...s,
              tips: s.tips.map((t) =>
                t.id === tipId ? { ...t, dismissed: true } : t
              ),
            }
          : s
      )
    );
  };

  const activeTips = selectedSeller.tips.filter(
    (t) => !t.dismissed
  );
  const urgentTips = activeTips.filter(
    (t) => t.priority === "urgent" || t.priority === "high"
  );
  const revenueProgress = Math.round(
    (selectedSeller.revenue / selectedSeller.revenueTarget) * 100
  );

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
          <div className="p-2 rounded-xl bg-arkos-blue/10 border border-arkos-blue/20">
            <Target className="h-5 w-5 text-arkos-blue-light" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-text-primary">
                Agente Coach
              </h1>
              <Badge variant="success" dot dotAnimate>
                Ativo
              </Badge>
              {urgentTips.length > 0 && (
                <Badge variant="danger">
                  ⚡ {urgentTips.length} urgente
                  {urgentTips.length > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <p className="text-xs text-text-muted">
              Coaching inteligente por vendedor
            </p>
          </div>
        </div>

        <Button
          variant="gold"
          size="sm"
          loading={isGenerating}
          onClick={handleGenerateTips}
          icon={<Bot className="h-3.5 w-3.5" />}
        >
          {isGenerating ? "Analisando..." : "Gerar Tips com IA"}
        </Button>
      </div>

      {/* ─── LAYOUT SPLIT ─── */}
      <div className="grid grid-cols-12 gap-4">

        {/* ─── SIDEBAR: SELEÇÃO DE VENDEDOR (3 cols) ─── */}
        <div className="col-span-12 lg:col-span-3 space-y-3">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide px-1">
            Equipe Comercial
          </h3>

          {/* Ranking rápido */}
          <div className="space-y-2">
            {sellers
              .sort((a, b) => b.coachScore - a.coachScore)
              .map((seller, i) => (
                <div key={seller.id} className="flex items-center gap-2">
                  <span className="text-base w-6 text-center shrink-0">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "4."}
                  </span>
                  <div className="flex-1 min-w-0">
                    <SellerScoreCard
                      seller={seller}
                      isSelected={seller.id === selectedId}
                      onClick={() => {
                        setSelectedId(seller.id);
                        setActiveTab("overview");
                      }}
                      compact
                    />
                  </div>
                </div>
              ))}
          </div>

          {/* KPI geral da equipe */}
          <Card padding="sm" className="mt-2">
            <p className="text-2xs font-semibold text-text-muted uppercase tracking-wide mb-3">
              Equipe — Jan/25
            </p>
            <div className="space-y-2">
              {[
                {
                  label: "Meta coletiva",
                  value: `${Math.round(
                    (sellers.reduce((s, v) => s + v.revenue, 0) /
                      sellers.reduce((s, v) => s + v.revenueTarget, 0)) *
                      100
                  )}%`,
                  color: "text-warning",
                },
                {
                  label: "Win rate médio",
                  value: `${Math.round(
                    sellers.reduce((s, v) => s + v.winRate, 0) /
                      sellers.length
                  )}%`,
                  color: "text-info",
                },
                {
                  label: "Receita total",
                  value: formatCurrency(
                    sellers.reduce((s, v) => s + v.revenue, 0)
                  ),
                  color: "text-success",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="flex items-center justify-between"
                >
                  <span className="text-2xs text-text-muted">{label}</span>
                  <span className={cn("text-xs font-bold", color)}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ─── ÁREA PRINCIPAL (9 cols) ─── */}
        <div className="col-span-12 lg:col-span-9 space-y-4">

          {/* Card do vendedor selecionado */}
          <SellerScoreCard seller={selectedSeller} isSelected />

          {/* Tabs */}
          <div className="flex gap-0 border-b border-arkos-border overflow-x-auto scrollbar-hide">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium",
                  "border-b-2 -mb-px transition-all whitespace-nowrap",
                  activeTab === id
                    ? "border-arkos-gold text-text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {id === "tips" && urgentTips.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-danger/10 text-danger text-2xs font-bold">
                    {urgentTips.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ─── TAB: VISÃO GERAL ─── */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Pontos fortes e melhorias */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-success/20 bg-success/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-4 w-4 text-success" />
                    <h4 className="text-sm font-semibold text-success">
                      Pontos Fortes
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {selectedSeller.strengths.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-text-secondary"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0 mt-1.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="border-warning/20 bg-warning/5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    <h4 className="text-sm font-semibold text-warning">
                      Áreas de Melhoria
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {selectedSeller.improvements.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-text-secondary"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0 mt-1.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              {/* Top tips urgentes na visão geral */}
              {urgentTips.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                      <Bot className="h-4 w-4 text-arkos-gold" />
                      Tips Prioritários
                    </h4>
                    <button
                      onClick={() => setActiveTab("tips")}
                      className="text-2xs text-arkos-blue-light hover:text-arkos-gold transition-colors"
                    >
                      Ver todos ({activeTips.length}) →
                    </button>
                  </div>
                  {urgentTips.slice(0, 2).map((tip) => (
                    <CoachTipCard
                      key={tip.id}
                      tip={tip}
                      onDismiss={handleDismissTip}
                      onFeedback={(id, fb) =>
                        toast.info(
                          `Feedback registrado: ${fb === "up" ? "👍" : "👎"}`
                        )
                      }
                      compact
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: TIPS DA IA ─── */}
          {activeTab === "tips" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-text-secondary">
                    {activeTips.length} tip
                    {activeTips.length !== 1 ? "s" : ""} ativo
                    {activeTips.length !== 1 ? "s" : ""}
                  </p>
                  {urgentTips.length > 0 && (
                    <Badge variant="danger" dot dotAnimate>
                      {urgentTips.length} urgente
                      {urgentTips.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="secondary"
                  size="xs"
                  loading={isGenerating}
                  onClick={handleGenerateTips}
                  icon={<RefreshCw className="h-3.5 w-3.5" />}
                >
                  Atualizar
                </Button>
              </div>

              {activeTips.length > 0 ? (
                <div className="space-y-3">
                  {activeTips
                    .sort((a, b) => {
                      const order = {
                        urgent: 0,
                        high: 1,
                        medium: 2,
                        low: 3,
                      };
                      return order[a.priority] - order[b.priority];
                    })
                    .map((tip) => (
                      <CoachTipCard
                        key={tip.id}
                        tip={tip}
                        onDismiss={handleDismissTip}
                        onFeedback={(id, fb) =>
                          toast.info(
                            `Feedback: ${fb === "up" ? "👍 Útil" : "👎 Não útil"}`
                          )
                        }
                      />
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Bot className="h-10 w-10 text-text-muted mb-3" />
                  <p className="text-sm text-text-secondary">
                    Nenhum tip ativo no momento
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Clique em &ldquo;Gerar Tips com IA&rdquo; para análise atualizada
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: VS EQUIPE ─── */}
          {activeTab === "comparison" && (
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-text-primary">
                  {selectedSeller.name} vs Equipe
                </h3>
                <Badge variant="default" size="sm">
                  {selectedSeller.period}
                </Badge>
              </div>
              <PeerComparisonChart
                comparisons={selectedSeller.peerComparisons}
                sellerName={selectedSeller.name.split(" ")[0]}
              />
            </Card>
          )}

          {/* ─── TAB: PADRÕES ─── */}
          {activeTab === "patterns" && (
            <div className="space-y-3">
              {selectedSeller.patterns.length > 0 ? (
                selectedSeller.patterns.map((pattern) => (
                  <Card
                    key={pattern.id}
                    className={cn(
                      "border",
                      pattern.impact === "positive"
                        ? "border-success/20 bg-success/5"
                        : pattern.impact === "negative"
                        ? "border-danger/20 bg-danger/5"
                        : "border-arkos-border"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "p-1.5 rounded-xl shrink-0",
                          pattern.impact === "positive"
                            ? "bg-success/20"
                            : pattern.impact === "negative"
                            ? "bg-danger/20"
                            : "bg-arkos-surface-3"
                        )}
                      >
                        <TrendingUp
                          className={cn(
                            "h-4 w-4",
                            pattern.impact === "positive"
                              ? "text-success"
                              : pattern.impact === "negative"
                              ? "text-danger"
                              : "text-text-muted"
                          )}
                        />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant={
                              pattern.impact === "positive"
                                ? "success"
                                : pattern.impact === "negative"
                                ? "danger"
                                : "default"
                            }
                            size="sm"
                          >
                            {pattern.impact === "positive"
                              ? "✅ Padrão Positivo"
                              : pattern.impact === "negative"
                              ? "⚠️ Padrão Negativo"
                              : "📊 Neutro"}
                          </Badge>
                          <Badge variant="default" size="sm">
                            {pattern.category}
                          </Badge>
                          <span className="text-2xs text-text-muted ml-auto">
                            {pattern.confidence}% confiança
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-text-primary">
                          {pattern.title}
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          {pattern.description}
                        </p>

                        <div className="space-y-1">
                          {pattern.dataPoints.map((dp, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 text-2xs text-text-muted"
                            >
                              <span className="w-1 h-1 rounded-full bg-text-muted shrink-0" />
                              {dp}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-16">
                  <BarChart3 className="h-10 w-10 text-text-muted mx-auto mb-3" />
                  <p className="text-sm text-text-secondary">
                    Padrões sendo analisados
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Precisamos de mais dados para identificar padrões
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: ATIVIDADES ─── */}
          {activeTab === "activities" && (
            <Card>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-text-primary">
                  Métricas de Atividade
                </h3>
                <Badge variant="default" size="sm">
                  {selectedSeller.period}
                </Badge>
              </div>

              <div className="space-y-5">
                {selectedSeller.activities.map((activity) => {
                  const pct = Math.round(
                    (activity.value / activity.target) * 100
                  );
                  const isGood = pct >= 100;
                  const isWarning = pct >= 70 && pct < 100;

                  return (
                    <div key={activity.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckSquare
                            className={cn(
                              "h-4 w-4",
                              isGood
                                ? "text-success"
                                : isWarning
                                ? "text-warning"
                                : "text-danger"
                            )}
                          />
                          <span className="text-sm font-medium text-text-primary">
                            {activity.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span
                              className={cn(
                                "text-lg font-bold",
                                isGood
                                  ? "text-success"
                                  : isWarning
                                  ? "text-warning"
                                  : "text-danger"
                              )}
                            >
                              {activity.value}
                            </span>
                            <span className="text-text-muted text-sm">
                              /{activity.target}
                            </span>
                          </div>

                          <div
                            className={cn(
                              "flex items-center gap-1 text-2xs font-medium w-12 justify-end",
                              activity.trend > 0
                                ? "text-success"
                                : activity.trend < 0
                                ? "text-danger"
                                : "text-text-muted"
                            )}
                          >
                            {activity.trend > 0 ? "↑" : activity.trend < 0 ? "↓" : "–"}
                            {Math.abs(activity.trend)}%
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <ProgressBar
                          value={pct}
                          autoColor
                          size="md"
                          animate
                          showLabel
                        />
                        <p className="text-2xs text-text-muted">
                          {activity.value} {activity.unit} realizados este mês
                          {pct < 100 && (
                            <span className="text-warning ml-1">
                              · Faltam {activity.target - activity.value}{" "}
                              {activity.unit}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Insight do coach */}
              <div className="mt-5 pt-4 border-t border-arkos-border">
                <p className="text-xs text-text-secondary flex items-start gap-2">
                  <Bot className="h-3.5 w-3.5 text-arkos-gold shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-text-primary">
                      Coach IA:
                    </strong>{" "}
                    {selectedSeller.activities.filter(
                      (a) => (a.value / a.target) < 0.7
                    ).length > 2
                      ? `${selectedSeller.name.split(" ")[0]} está abaixo da meta em várias métricas. Volume de atividade é o principal preditor de resultado — cada 10% de aumento nas ligações gera +1.4 negócio fechado historicamente.`
                      : `${selectedSeller.name.split(" ")[0]} está com boa cadência de atividades. Mantenha o ritmo e foque na qualidade das abordagens.`}
                  </span>
                </p>
              </div>
            </Card>
          )}

          {/* ─── TAB: PLAYBOOKS ─── */}
          {activeTab === "playbooks" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-secondary">
                  {MOCK_PLAYBOOKS.length} playbooks disponíveis
                </p>
                <Button
                  variant="secondary"
                  size="xs"
                  icon={<Star className="h-3.5 w-3.5" />}
                >
                  Criar Playbook
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {MOCK_PLAYBOOKS.map((playbook) => (
                  <PlaybookCard key={playbook.id} playbook={playbook} />
                ))}
              </div>

              {/* Banner IA */}
              <Card className="border-arkos-gold/20 bg-arkos-gold/5">
                <div className="flex items-start gap-3">
                  <Bot className="h-5 w-5 text-arkos-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-arkos-gold mb-1">
                      Gerar Playbook Personalizado
                    </p>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      O Coach IA pode criar um playbook específico para{" "}
                      {selectedSeller.name.split(" ")[0]} baseado nos padrões
                      identificados e nas áreas de melhoria. Leva menos de
                      30 segundos.
                    </p>
                    <Button
                      variant="gold"
                      size="sm"
                      className="mt-3"
                      icon={<Zap className="h-3.5 w-3.5" />}
                      onClick={() => toast.info("Gerando playbook personalizado...")}
                    >
                      Gerar para {selectedSeller.name.split(" ")[0]}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
