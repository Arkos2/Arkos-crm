import { SellerPerformance, Playbook, CoachTip } from "@/lib/types/coach";

export const MOCK_SELLERS: SellerPerformance[] = [
  {
    id: "u-002",
    name: "Maria Santos",
    role: "Sênior Account Executive",
    level: "top_performer",
    period: "Janeiro 2025",

    revenue: 125000,
    revenueTarget: 150000,
    dealsClosed: 9,
    dealsClosedTarget: 10,
    winRate: 71,
    avgTicket: 52000,
    avgCycleLength: 14,

    activities: [
      { label: "Ligações", value: 48, target: 40, unit: "ligações", trend: 20 },
      { label: "Reuniões", value: 12, target: 10, unit: "reuniões", trend: 20 },
      { label: "Propostas", value: 8, target: 8, unit: "propostas", trend: 0 },
      { label: "Follow-ups", value: 34, target: 30, unit: "follow-ups", trend: 13 },
      { label: "Demos", value: 7, target: 6, unit: "demos", trend: 16 },
    ],

    peerComparisons: [
      { metric: "Win Rate", sellerValue: 71, teamAvg: 52, topPerformerValue: 71, unit: "%", higherIsBetter: true },
      { metric: "Ciclo Médio", sellerValue: 14, teamAvg: 24, topPerformerValue: 14, unit: " dias", higherIsBetter: false },
      { metric: "Ticket Médio", sellerValue: 52000, teamAvg: 43000, topPerformerValue: 52000, unit: "", higherIsBetter: true },
      { metric: "Taxa de Reunião", sellerValue: 68, teamAvg: 45, topPerformerValue: 68, unit: "%", higherIsBetter: true },
    ],

    patterns: [
      {
        id: "pat-001",
        category: "timing",
        title: "Fecha 2x mais quando faz demo na 1ª reunião",
        description: "Em 89% dos negócios fechados, Maria realizou uma demonstração rápida já no primeiro contato com o decisor.",
        impact: "positive",
        confidence: 91,
        dataPoints: ["71% win rate com demo na 1ª reunião", "38% win rate sem demo na 1ª reunião", "9 de 9 fechamentos seguiram esse padrão"],
      },
      {
        id: "pat-002",
        category: "timing",
        title: "Melhor horário de ligação: 9h-11h terças e quartas",
        description: "Taxa de atendimento de ligações 3x maior nesse bloco horário comparado a outros períodos.",
        impact: "positive",
        confidence: 84,
        dataPoints: ["87% de atendimento terça/quarta manhã", "31% de atendimento em outros horários"],
      },
      {
        id: "pat-003",
        category: "approach",
        title: "Usa perguntas de impacto antes de apresentar a solução",
        description: 'Antes de mostrar o produto, Maria faz sempre a pergunta: "O que acontece se esse problema não for resolvido em 6 meses?"',
        impact: "positive",
        confidence: 78,
        dataPoints: ["Aumenta urgência em 67% dos casos", "Leads que respondem essa pergunta têm BANT 40% maior"],
      },
    ],

    coachScore: 91,
    coachScoreTrend: 5,
    strengths: [
      "Taxa de fechamento 37% acima da média",
      "Ciclo de venda mais curto da equipe (14 dias)",
      "Melhor NPS de clientes (9.4/10)",
      "Consistência de atividades (meta batida em 4/5)",
    ],
    improvements: [
      "Pipeline concentration: 60% do valor em apenas 2 clientes",
      "Pouca exploração do setor Educação (oportunidade detectada)",
    ],

    tips: [
      {
        id: "tip-m-001",
        type: "best_practice",
        priority: "low",
        title: "Playbook da demo na 1ª reunião já foi compartilhado",
        message: "Seu padrão de demo executiva está sendo replicado para a equipe. Continue sendo referência!",
        impact: "Impacto estimado: +R$40k/mês na equipe",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "tip-m-002",
        type: "deal_risk",
        priority: "medium",
        title: "Concentração de risco no pipeline",
        message: "60% do seu pipeline está em 2 negócios (SaúdeTec + LogiMax). Se um cair, impacto é grande. Recomendo prospectar mais 3 leads esta semana.",
        actionLabel: "Ver Pipeline",
        actionHref: "/pipeline",
        dataPoints: ["SaúdeTec: R$120k", "LogiMax: R$85k", "Restante: R$137k (12 deals)"],
        impact: "Reduzir concentração para menos de 40% por deal",
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
    ],
  },

  {
    id: "u-001",
    name: "João Silva",
    role: "Account Executive",
    level: "pleno",
    period: "Janeiro 2025",

    revenue: 112000,
    revenueTarget: 150000,
    dealsClosed: 7,
    dealsClosedTarget: 10,
    winRate: 58,
    avgTicket: 43000,
    avgCycleLength: 22,

    activities: [
      { label: "Ligações", value: 31, target: 40, unit: "ligações", trend: -5 },
      { label: "Reuniões", value: 8, target: 10, unit: "reuniões", trend: -20 },
      { label: "Propostas", value: 6, target: 8, unit: "propostas", trend: -25 },
      { label: "Follow-ups", value: 22, target: 30, unit: "follow-ups", trend: -27 },
      { label: "Demos", value: 4, target: 6, unit: "demos", trend: -33 },
    ],

    peerComparisons: [
      { metric: "Win Rate", sellerValue: 58, teamAvg: 52, topPerformerValue: 71, unit: "%", higherIsBetter: true },
      { metric: "Ciclo Médio", sellerValue: 22, teamAvg: 24, topPerformerValue: 14, unit: " dias", higherIsBetter: false },
      { metric: "Ticket Médio", sellerValue: 43000, teamAvg: 43000, topPerformerValue: 52000, unit: "", higherIsBetter: true },
      { metric: "Taxa de Reunião", sellerValue: 45, teamAvg: 45, topPerformerValue: 68, unit: "%", higherIsBetter: true },
    ],

    patterns: [
      {
        id: "pat-004",
        category: "stage",
        title: "Leads ficam em média 8 dias em Proposta",
        description: "João envia a proposta mas demora para fazer follow-up. A média da equipe é 4 dias nessa etapa.",
        impact: "negative",
        confidence: 87,
        dataPoints: ["Média João em Proposta: 8 dias", "Média equipe: 4 dias", "Maria Santos: 2 dias"],
      },
      {
        id: "pat-005",
        category: "channel",
        title: "WhatsApp tem 3x mais resposta que e-mail",
        description: "João usa e-mail em 80% dos follow-ups, mas seu histórico mostra que WhatsApp tem resposta muito maior.",
        impact: "negative",
        confidence: 82,
        dataPoints: ["Taxa resposta e-mail: 18%", "Taxa resposta WhatsApp: 54%", "Uso atual de WhatsApp: 20%"],
      },
    ],

    coachScore: 74,
    coachScoreTrend: 3,
    strengths: [
      "Win rate acima da média (58% vs 52%)",
      "Bom relacionamento com clientes — NPS 8.7",
      "Forte em negociações de preço",
    ],
    improvements: [
      "Volume de atividades abaixo da meta em 4/5 métricas",
      "Tempo de follow-up pós-proposta muito alto (8 dias)",
      "Subutilizando WhatsApp (20% vs recomendado 50%)",
    ],

    tips: [
      {
        id: "tip-j-001",
        type: "timing",
        priority: "urgent",
        title: "Proposta da FinTech Capital aberta — ligue agora!",
        message: "Camila abriu o contrato da FinTech Capital 2x hoje. Histórico mostra que ligações feitas em até 30min após abertura têm 4x mais chance de fechar.",
        actionLabel: "Ver Negócio",
        actionHref: "/pipeline",
        dealId: "deal-007",
        dealTitle: "FinTech Capital — Suite Completa",
        impact: "Estimativa: 89% de chance de fechar se ligar agora",
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
      },
      {
        id: "tip-j-002",
        type: "performance",
        priority: "high",
        title: "Volume de follow-ups 27% abaixo da meta",
        message: "Você fez 22 follow-ups este mês (meta: 30). Maria Santos faz em média 34 por mês e atribui isso ao maior win rate dela. Tente bloquear 30min diários para follow-up.",
        dataPoints: ["João: 22 follow-ups", "Meta: 30", "Maria: 34 (líder)"],
        impact: "Cada +5 follow-ups = +1.2 negócio fechado (dado histórico)",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "tip-j-003",
        type: "best_practice",
        priority: "high",
        title: "Use mais WhatsApp no follow-up de proposta",
        message: "Seu histórico mostra 54% de resposta no WhatsApp vs 18% no e-mail. Maria Santos usa WhatsApp como primeiro canal de follow-up e fecha em 2 dias pós-proposta vs seus 8 dias.",
        dataPoints: ["WhatsApp João: 54% resposta", "E-mail João: 18% resposta", "Uso atual: 20% WhatsApp"],
        impact: "Potencial: reduzir ciclo de 22 para 15 dias",
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
      {
        id: "tip-j-004",
        type: "comparison",
        priority: "medium",
        title: "Aplique a técnica de demo na 1ª reunião",
        message: 'Maria Santos fecha 71% dos leads que passam por demo na 1ª reunião. Você fechou 0% sem demo inicial. Tente incluir uma demonstração rápida (15min) em toda primeira reunião com decisor.',
        dataPoints: ["Maria com demo na 1ª reunião: 71%", "João sem demo: 38%", "Próxima reunião: EduPlus (amanhã 14h)"],
        impact: "Estimativa: +13 pontos percentuais no win rate",
        createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      },
    ],
  },

  {
    id: "u-003",
    name: "Pedro Lima",
    role: "Account Executive",
    level: "pleno",
    period: "Janeiro 2025",

    revenue: 78000,
    revenueTarget: 120000,
    dealsClosed: 5,
    dealsClosedTarget: 8,
    winRate: 43,
    avgTicket: 38000,
    avgCycleLength: 31,

    activities: [
      { label: "Ligações", value: 22, target: 40, unit: "ligações", trend: -12 },
      { label: "Reuniões", value: 5, target: 10, unit: "reuniões", trend: -50 },
      { label: "Propostas", value: 4, target: 8, unit: "propostas", trend: -50 },
      { label: "Follow-ups", value: 14, target: 30, unit: "follow-ups", trend: -40 },
      { label: "Demos", value: 2, target: 6, unit: "demos", trend: -67 },
    ],

    peerComparisons: [
      { metric: "Win Rate", sellerValue: 43, teamAvg: 52, topPerformerValue: 71, unit: "%", higherIsBetter: true },
      { metric: "Ciclo Médio", sellerValue: 31, teamAvg: 24, topPerformerValue: 14, unit: " dias", higherIsBetter: false },
      { metric: "Ticket Médio", sellerValue: 38000, teamAvg: 43000, topPerformerValue: 52000, unit: "", higherIsBetter: true },
      { metric: "Taxa de Reunião", sellerValue: 28, teamAvg: 45, topPerformerValue: 68, unit: "%", higherIsBetter: true },
    ],

    patterns: [
      {
        id: "pat-006",
        category: "stage",
        title: "Baixo volume de atividades em todas as métricas",
        description: "Pedro está abaixo da meta em todas as 5 métricas de atividade. O padrão sugere dificuldade de gestão do tempo ou bloqueios não identificados.",
        impact: "negative",
        confidence: 95,
        dataPoints: ["Ligações: 55% da meta", "Reuniões: 50% da meta", "Follow-ups: 47% da meta"],
      },
      {
        id: "pat-007",
        category: "stage",
        title: "Dificuldade específica em negociações Enterprise",
        description: "Pedro perde 80% dos negócios acima de R$60k. Deals menores têm 61% de win rate — seu ponto forte.",
        impact: "negative",
        confidence: 88,
        dataPoints: ["Win rate deals > R$60k: 20%", "Win rate deals < R$60k: 61%", "3 perdas Enterprise em jan"],
      },
    ],

    coachScore: 51,
    coachScoreTrend: -4,
    strengths: [
      "Bom win rate em deals menores (61%)",
      "Boa qualidade nas propostas enviadas",
    ],
    improvements: [
      "Volume de atividades 50% abaixo da meta",
      "Dificuldade crítica em negociações Enterprise",
      "Ciclo de venda 29% acima da média",
      "Baixa taxa de conversão para reunião (28%)",
    ],

    tips: [
      {
        id: "tip-p-001",
        type: "deal_risk",
        priority: "urgent",
        title: "Negócio Construtora Viva precisa de apoio",
        message: "O deal da Construtora Viva (R$67k) está em Negociação há 6 dias sem avanço. Esse é um ticket Enterprise onde seu histórico mostra dificuldade. Recomendo incluir Maria Santos ou o Diretor na próxima reunião.",
        actionLabel: "Ver Negócio",
        actionHref: "/pipeline",
        dealId: "deal-006",
        dealTitle: "Construtora Viva — CRM",
        dataPoints: ["6 dias sem avanço", "Histórico: 80% de perda em deals > R$60k"],
        impact: "R$67k em risco — trazer reforço aumenta chance em 60%",
        createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      },
      {
        id: "tip-p-002",
        type: "performance",
        priority: "urgent",
        title: "Atividades 50% abaixo — precisa de plano de ação",
        message: "Suas atividades caíram significativamente. Para atingir a meta, você precisa de: 18 ligações, 5 reuniões e 16 follow-ups nas próximas 2 semanas. Vou criar um plano diário para você.",
        dataPoints: ["Meta restante: 18 ligações", "Meta restante: 16 follow-ups", "Tempo restante: 2 semanas"],
        impact: "Plano de recuperação aumenta chance de bater meta em 40%",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
  },

  {
    id: "u-004",
    name: "Ana Costa",
    role: "Junior Account Executive",
    level: "junior",
    period: "Janeiro 2025",

    revenue: 67000,
    revenueTarget: 120000,
    dealsClosed: 4,
    dealsClosedTarget: 8,
    winRate: 38,
    avgTicket: 32000,
    avgCycleLength: 28,

    activities: [
      { label: "Ligações", value: 38, target: 40, unit: "ligações", trend: 5 },
      { label: "Reuniões", value: 7, target: 10, unit: "reuniões", trend: 17 },
      { label: "Propostas", value: 5, target: 8, unit: "propostas", trend: 0 },
      { label: "Follow-ups", value: 25, target: 30, unit: "follow-ups", trend: 8 },
      { label: "Demos", value: 3, target: 6, unit: "demos", trend: 0 },
    ],

    peerComparisons: [
      { metric: "Win Rate", sellerValue: 38, teamAvg: 52, topPerformerValue: 71, unit: "%", higherIsBetter: true },
      { metric: "Ciclo Médio", sellerValue: 28, teamAvg: 24, topPerformerValue: 14, unit: " dias", higherIsBetter: false },
      { metric: "Ticket Médio", sellerValue: 32000, teamAvg: 43000, topPerformerValue: 52000, unit: "", higherIsBetter: true },
      { metric: "Taxa de Reunião", sellerValue: 42, teamAvg: 45, topPerformerValue: 68, unit: "%", higherIsBetter: true },
    ],

    patterns: [
      {
        id: "pat-008",
        category: "approach",
        title: "Alta atividade mas baixa conversão",
        description: "Ana faz quase todas as atividades (95% da meta de ligações) mas converte pouco. O problema não é esforço — é qualidade da abordagem.",
        impact: "neutral",
        confidence: 89,
        dataPoints: ["Ligações: 95% da meta", "Reuniões de ligação: 42% (meta equipe: 45%)", "Win rate: 38% (meta: 52%)"],
      },
    ],

    coachScore: 62,
    coachScoreTrend: 8,
    strengths: [
      "Volume de atividades próximo da meta",
      "Evolução positiva em 4 das 5 métricas",
      "Alta energia e engajamento",
    ],
    improvements: [
      "Qualidade da abordagem precisa melhorar",
      "Ticket médio 26% abaixo da média",
      "Win rate 14pp abaixo da meta",
    ],

    tips: [
      {
        id: "tip-a-001",
        type: "best_practice",
        priority: "high",
        title: "Shadow com Maria Santos esta semana",
        message: "Você tem o esforço certo, mas a abordagem precisa evoluir. Recomendo acompanhar 2 reuniões da Maria esta semana para absorver a técnica de demo executiva e perguntas de impacto.",
        impact: "Sellers que fazem shadow melhoram win rate em 18% em 30 dias",
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
      {
        id: "tip-a-002",
        type: "objection",
        priority: "high",
        title: "Script para contornar objeção de preço",
        message: 'Você perdeu 3 deals por "preço alto" este mês. O argumento que mais funciona para o perfil ARKOS: calcule o custo do problema atual (horas perdidas × salário) e compare com nosso investimento. O ROI médio é 8 meses.',
        dataPoints: ["3 perdas por preço em jan", "ROI médio clientes ARKOS: 8 meses", "Clientes que viram ROI fecham 78%"],
        impact: "Potencial: recuperar 1-2 deals por mês",
        createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      },
      {
        id: "tip-a-003",
        type: "celebration",
        priority: "low",
        title: "🎉 +8 pontos no Coach Score este mês!",
        message: "Sua evolução foi a maior da equipe em janeiro (+8 pontos). Você está no caminho certo. Continue focada e em 2-3 meses estará no nível Pleno.",
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      },
    ],
  },
];

export const MOCK_PLAYBOOKS: Playbook[] = [
  {
    id: "play-001",
    title: "Demo Executiva na 1ª Reunião",
    description: "Técnica de Maria Santos: realizar uma demonstração de 15min já no primeiro contato com o decisor",
    author: "Maria Santos (Top Performer)",
    category: "approach",
    successRate: 71,
    usageCount: 9,
    steps: [
      {
        order: 1,
        title: "Abrir com a pergunta de impacto",
        description: 'Antes de qualquer apresentação, pergunte: "O que acontece com a empresa se esse problema não for resolvido nos próximos 6 meses?"',
        tip: "Deixe o silêncio trabalhar. Não complete a frase deles.",
      },
      {
        order: 2,
        title: "Mostrar o 'momento aha' em 5 minutos",
        description: "Vá direto para a funcionalidade que resolve o problema que eles acabaram de descrever. Não faça tour completo.",
        tip: "Prepare 3 cenários diferentes antes da reunião.",
      },
      {
        order: 3,
        title: "Perguntar sobre o processo de decisão",
        description: '"Assumindo que isso faz sentido para vocês, como seria o processo para avançar?" — mapeia Authority e Timeline em uma só pergunta.',
      },
      {
        order: 4,
        title: "Propor próximo passo concreto",
        description: "Nunca termine sem uma data. 'Posso te enviar a proposta até quinta e agendamos sexta para revisar juntos?'",
        tip: "Dê duas opções de data. Nunca deixe aberto.",
      },
    ],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "play-002",
    title: "Contorno de Objeção de Preço com ROI",
    description: "Como transformar 'está caro' em uma conversa de valor e retorno sobre investimento",
    author: "Agente Coach IA",
    category: "objection",
    successRate: 58,
    usageCount: 14,
    steps: [
      {
        order: 1,
        title: "Validar a objeção sem concordar",
        description: '"Entendo sua preocupação. O investimento é relevante e faz sentido avaliar com cuidado." — nunca diga "você tem razão, é caro".',
      },
      {
        order: 2,
        title: "Calcular o custo do problema atual",
        description: "Pergunte: quantas horas por semana sua equipe gasta nesse processo? Multiplique pelo salário médio. Esse é o custo real do status quo.",
        tip: "Tenha uma planilha simples de cálculo de ROI pronta.",
      },
      {
        order: 3,
        title: "Apresentar o ROI em meses",
        description: "Compare o custo atual (anual) com o investimento na ARKOS. Mostre o payback em meses. Média: 8 meses para clientes do mesmo perfil.",
      },
      {
        order: 4,
        title: "Oferecer prova social do mesmo perfil",
        description: "Cite uma empresa similar que tinha a mesma objeção e o resultado após a implementação.",
      },
    ],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "play-003",
    title: "Sequência Pós-Proposta em 48h",
    description: "Como fazer follow-up da proposta sem ser chato e aumentar a taxa de resposta",
    author: "Maria Santos + Agente Coach IA",
    category: "timing",
    successRate: 67,
    usageCount: 23,
    steps: [
      {
        order: 1,
        title: "Dia 0 — E-mail de envio com âncora",
        description: "Envie a proposta com uma âncora de prazo: 'Vou ligar na quinta para tirar dúvidas.' Isso cria expectativa e você não parece intruso na ligação.",
      },
      {
        order: 2,
        title: "Dia 1 — WhatsApp simples",
        description: '"Oi [nome]! A proposta chegou certinho? 😊" — curto, sem pressão. Taxa de resposta: 61%.',
        tip: "Envie entre 9h-10h. Evite segunda-feira.",
      },
      {
        order: 3,
        title: "Dia 2 — Adicionar valor por e-mail",
        description: "Não pergunte sobre a proposta. Envie algo útil: um case similar, um dado do setor, um artigo. Lembra que você existe sem pressionar.",
      },
      {
        order: 4,
        title: "Dia 3 — Ligação na hora marcada",
        description: "Ligue no horário que você prometeu no e-mail inicial. Pergunte sobre o que ficou de dúvida, não se vai fechar.",
      },
    ],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];
