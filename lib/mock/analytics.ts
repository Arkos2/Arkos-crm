import { AnalystInsight } from "@/lib/types/agent";

export const MOCK_INSIGHTS: AnalystInsight[] = [
  {
    id: "ins-001",
    level: "urgent",
    title: "Gargalo crítico: Proposta → Negociação caiu 22%",
    description:
      "A conversão entre Proposta e Negociação caiu de 68% para 53% nos últimos 14 dias. O tempo médio nessa etapa aumentou de 4 para 9 dias. Leads estão esfriando antes de avançar.",
    dataPoints: [
      "Conversão Proposta→Negociação: 53% (era 68%)",
      "Tempo médio na etapa: 9 dias (era 4 dias)",
      "5 propostas enviadas há mais de 7 dias sem resposta",
      "Média de follow-ups por proposta: 0.8 (ideal: 2+)",
    ],
    actions: [
      { label: "Ver Propostas Paradas", action: "view_stale_proposals" },
      { label: "Ativar Sequência Automática", action: "activate_followup" },
    ],
    confidence: 94,
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: "ins-002",
    level: "opportunity",
    title: "Setor Saúde: conversão 3x acima da média",
    description:
      "Leads do setor de Saúde estão convertendo 67% das vezes, comparado à média geral de 22%. Ticket médio também é 85% maior. Há apenas 2 leads desse setor no pipeline — oportunidade de expansão imediata.",
    dataPoints: [
      "Conversão Saúde: 67% vs média 22%",
      "Ticket médio Saúde: R$ 98k vs R$ 53k geral",
      "Ciclo de venda: 18 dias (vs 27 dias geral)",
      "Apenas 2 leads de Saúde no pipeline atual",
    ],
    actions: [
      { label: "Prospectar Setor Saúde", action: "prospect_health" },
      { label: "Criar Campanha Específica", action: "create_campaign" },
    ],
    confidence: 88,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "ins-003",
    level: "win",
    title: "Maria Santos: taxa de fechamento 2x superior após demo",
    description:
      "Maria fecha 71% dos leads que passaram por uma demo executiva na primeira reunião, comparado a 34% da equipe. Essa abordagem pode ser replicada como padrão do processo.",
    dataPoints: [
      "Taxa fechamento Maria (demo na 1ª reunião): 71%",
      "Taxa fechamento restante equipe: 34%",
      "Ciclo de venda de Maria: 14 dias (média equipe: 27)",
      "NPS dos clientes dela: 9.2/10",
    ],
    actions: [
      { label: "Ver Playbook da Maria", action: "view_playbook" },
      { label: "Treinar Equipe", action: "train_team" },
    ],
    confidence: 91,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: "ins-004",
    level: "trend",
    title: "Terças e quartas são os melhores dias para fechar",
    description:
      "Analisando os últimos 6 meses, 67% dos contratos assinados ocorreram entre terça e quarta-feira, no período da tarde (13h-17h). Ligações de follow-up nesse período têm 2.4x mais resposta.",
    dataPoints: [
      "67% dos fechamentos: terça ou quarta",
      "Melhor horário: 14h-16h",
      "Taxa de resposta nesse período: 2.4x maior",
      "Segunda-feira tem a pior taxa: 12% dos fechamentos",
    ],
    actions: [
      { label: "Ajustar Agendamentos", action: "adjust_scheduling" },
      { label: "Configurar Coach IA", action: "configure_coach" },
    ],
    confidence: 82,
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: "ins-005",
    level: "urgent",
    title: "3 leads de alto valor sem contato há +5 dias",
    description:
      "SaúdeTec (R$120k), Construtora Viva (R$67k) e FinTech Capital (R$95k) estão sem atividade registrada há mais de 5 dias. Esses 3 negócios somam R$282k — 33% do pipeline total.",
    dataPoints: [
      "SaúdeTec: sem contato há 5 dias (R$120k)",
      "Construtora Viva: sem contato há 6 dias (R$67k)",
      "FinTech Capital: proposta enviada há 3 dias, não visualizada",
      "Total em risco: R$282k (33% do pipeline)",
    ],
    actions: [
      { label: "Ver Negócios em Risco", action: "view_at_risk" },
      { label: "Ativar Agente Follow-Up", action: "activate_followup_agent" },
    ],
    confidence: 97,
    createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
  },
];

export const MOCK_PIPELINE_DATA = {
  totalValue: 847500,
  weightedValue: 312400,
  dealCount: 23,
  activeDeals: 20,
  wonThisMonth: 8,
  lostThisMonth: 3,
  avgCycleLength: 12,
  conversionRate: 67,
  stages: [
    { name: "Prospecção", count: 8, value: 240000, conversion: null },
    { name: "Qualificação", count: 5, value: 175000, conversion: 68 },
    { name: "Diagnóstico", count: 4, value: 160000, conversion: 62 },
    { name: "Proposta", count: 3, value: 120000, conversion: 53 },
    { name: "Negociação", count: 2, value: 95000, conversion: 68 },
    { name: "Fechamento", count: 1, value: 57500, conversion: 74 },
  ],
  lossReasons: [
    { reason: "Preço muito alto", count: 5, percentage: 35 },
    { reason: "Perdeu para concorrente", count: 3, percentage: 25 },
    { reason: "Sem resposta", count: 2, percentage: 18 },
    { reason: "Decidiu não investir", count: 2, percentage: 12 },
    { reason: "Timing inadequado", count: 1, percentage: 10 },
  ],
  teamPerformance: [
    { name: "Maria Santos", revenue: 125000, target: 150000, deals: 9, winRate: 71 },
    { name: "João Silva", revenue: 112000, target: 150000, deals: 7, winRate: 58 },
    { name: "Pedro Lima", revenue: 78000, target: 120000, deals: 5, winRate: 43 },
    { name: "Ana Costa", revenue: 67000, target: 120000, deals: 4, winRate: 38 },
  ],
  revenueHistory: [
    { month: "Jul", realized: 180000, target: 200000 },
    { month: "Ago", realized: 220000, target: 210000 },
    { month: "Set", realized: 195000, target: 220000 },
    { month: "Out", realized: 260000, target: 230000 },
    { month: "Nov", realized: 310000, target: 250000 },
    { month: "Dez", realized: 380000, target: 300000 },
    { month: "Jan", realized: 125000, target: 350000, isCurrent: true },
  ],
  unitEconomics: {
    cac: 2340,
    ltv: 18700,
    ltvCacRatio: 8.0,
    paybackMonths: 3.2,
    churnRate: 4.2,
    mrr: 127000,
    arr: 1524000,
  },
};
