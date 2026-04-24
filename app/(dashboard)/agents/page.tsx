import { Metadata } from "next";
import { AgentCard } from "@/components/agents/AgentCard";
import { AgentMetrics } from "@/lib/types/agent";
import { Card } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Bot, Activity, Zap, TrendingUp, Settings, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Agentes IA" };

const MOCK_METRICS: AgentMetrics[] = [];

const RECENT_LOGS: any[] = [];


export default function AgentsPage() {
  const activeCount = MOCK_METRICS.filter((m) => m.status === "active").length;
  const todayTotal = MOCK_METRICS.reduce((s, m) => s + m.todayActions, 0);
  const avgSuccess = Math.round(
    MOCK_METRICS.reduce((s, m) => s + m.successRate, 0) / MOCK_METRICS.length
  );

  return (
    <div className="space-y-6">

      {/* ─── HEADER ─── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-text-primary">
              Central de Agentes IA
            </h1>
            <Badge variant="gold" dot dotAnimate>
              {activeCount}/6 ativos
            </Badge>
          </div>
          <p className="text-sm text-text-muted mt-0.5">
            Orquestração inteligente de automação comercial
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-arkos-surface-2 border border-arkos-border-2 text-text-primary hover:border-arkos-blue/50 transition-all">
            <RefreshCw className="h-3.5 w-3.5" />
            Atualizar
          </button>
          <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-arkos-surface-2 border border-arkos-border-2 text-text-primary hover:border-arkos-blue/50 transition-all">
            <Settings className="h-3.5 w-3.5" />
            Configurar
          </button>
        </div>
      </div>

      {/* ─── KPIs ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Bot, label: "Agentes Ativos", value: `${activeCount}/6`, color: "text-success" },
          { icon: Activity, label: "Ações Hoje", value: String(todayTotal), color: "text-arkos-blue-light" },
          { icon: TrendingUp, label: "Taxa de Sucesso", value: `${avgSuccess}%`, color: "text-arkos-gold" },
          { icon: Zap, label: "Tokens Usados", value: "18.4k", color: "text-purple-400" },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-arkos-surface-3">
              <Icon className={cn("h-4 w-4", color)} />
            </div>
            <div>
              <p className="text-2xs text-text-muted">{label}</p>
              <p className={cn("text-lg font-bold", color)}>{value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ─── GRID DE AGENTES ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_METRICS.map((metrics) => (
          <AgentCard key={metrics.type} metrics={metrics} />
        ))}
      </div>

      {/* ─── LOG DO ORQUESTRADOR ─── */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-arkos-gold" />
            <h3 className="text-sm font-semibold text-text-primary">
              Log do Orquestrador
            </h3>
          </div>
          <Badge variant="default" size="sm">Últimas 24h</Badge>
        </div>

        <div className="space-y-2">
          {RECENT_LOGS.map((log, i) => (
            <div
              key={i}
              className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-arkos-surface-2 transition-colors"
            >
              <div className={cn(
                "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                log.level === "success" && "bg-success",
                log.level === "info" && "bg-info",
                log.level === "warning" && "bg-warning",
                log.level === "danger" && "bg-danger",
              )} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-2xs font-semibold text-text-secondary">{log.agent}</span>
                  <span className="text-2xs text-text-muted">{log.time}</span>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">{log.action}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
