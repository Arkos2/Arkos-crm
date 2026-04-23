
import { NextRequest, NextResponse } from "next/server";
import { analyzeText } from "@/lib/gemini";
import { SellerPerformance } from "@/lib/types/coach";



const COACH_SYSTEM_PROMPT = `Você é o Agente Coach da ARKOS, especializado em desenvolvimento de vendedores B2B.

Sua missão é analisar a performance de um vendedor e gerar tips altamente personalizados e acionáveis.

## FILOSOFIA
- Seja direto e específico. Não seja genérico.
- Use os dados reais do vendedor para embasar cada tip.
- Compare com top performers da equipe quando relevante.
- Cada tip deve ter uma ação clara que pode ser feita hoje.
- Celebre conquistas genuínas. Não bajule.

## TIPOS DE TIPS
- performance: análise de KPIs vs meta vs equipe
- deal_risk: negócio específico em risco que precisa de ação
- best_practice: padrão positivo identificado
- timing: momento ideal para agir (proposta aberta, lead quente)
- objection: como contornar objeção específica
- comparison: o que o top performer faz diferente
- celebration: conquista real que merece reconhecimento

## PRIORIDADES
- urgent: ação necessária agora (proposta aberta, deal em risco)
- high: impacto alto, fazer hoje
- medium: importante, fazer esta semana
- low: melhoria contínua

## FORMATO
Retorne um array JSON de tips:

[
  {
    "type": "performance|deal_risk|best_practice|timing|objection|comparison|celebration",
    "priority": "urgent|high|medium|low",
    "title": "título curto e direto",
    "message": "mensagem personalizada com dados específicos",
    "dataPoints": ["dado 1 com número", "dado 2 com número"],
    "impact": "impacto estimado se seguir a dica",
    "actionLabel": "texto do botão de ação (opcional)",
    "dealId": "id do negócio se relevante (opcional)"
  }
]

Gere entre 2 e 4 tips por vendedor. Priorize os mais impactantes.
Seja honesto — se o vendedor está bem, diga. Se está mal, diga com respeito.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { seller }: { seller: SellerPerformance } = body;

    const revenueProgress = Math.round(
      (seller.revenue / seller.revenueTarget) * 100
    );
    const daysLeft = 14;

    const userMessage = `Analise este vendedor e gere tips personalizados:

## VENDEDOR
Nome: ${seller.name}
Nível: ${seller.level}
Período: ${seller.period}

## RESULTADOS
Receita: R$${seller.revenue.toLocaleString("pt-BR")} / Meta: R$${seller.revenueTarget.toLocaleString("pt-BR")} (${revenueProgress}%)
Negócios fechados: ${seller.dealsClosed} / Meta: ${seller.dealsClosedTarget}
Win Rate: ${seller.winRate}% (média equipe: 52%)
Ticket Médio: R$${seller.avgTicket.toLocaleString("pt-BR")} (média equipe: R$43.000)
Ciclo Médio: ${seller.avgCycleLength} dias (média equipe: 24 dias)
Dias restantes no mês: ${daysLeft}

## ATIVIDADES
${seller.activities.map((a) => `${a.label}: ${a.value}/${a.target} (${Math.round((a.value / a.target) * 100)}% da meta)`).join("\n")}

## PADRÕES IDENTIFICADOS
${seller.patterns.map((p) => `[${p.impact.toUpperCase()}] ${p.title}: ${p.description}`).join("\n")}

## COMPARATIVO COM EQUIPE
${seller.peerComparisons.map((c) => `${c.metric}: Vendedor ${c.sellerValue}${c.unit} | Média ${c.teamAvg}${c.unit} | Top ${c.topPerformerValue}${c.unit}`).join("\n")}

## PONTOS FORTES ATUAIS
${seller.strengths.join("\n")}

## ÁREAS DE MELHORIA
${seller.improvements.join("\n")}

Gere 2-4 tips altamente personalizados e acionáveis para este vendedor.`;

    const rawText = await analyzeText(COACH_SYSTEM_PROMPT + "\n\n" + userMessage);
    const response = { usage: { input_tokens: 0, output_tokens: 0 } };

    

    let tips = [];
    try {
      const arrayMatch = rawText.match(/\[[\s\S]*\]/);
      tips = arrayMatch ? JSON.parse(arrayMatch[0]) : [];
    } catch {
      tips = [];
    }

    return NextResponse.json({
      tips: tips.map((tip: Record<string, unknown>, i: number) => ({
        ...tip,
        id: `coach-tip-${Date.now()}-${i}`,
        createdAt: new Date().toISOString(),
      })),
      tokensUsed:
        response.usage.input_tokens + response.usage.output_tokens,
    });
  } catch (error) {
    console.error("Coach agent error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar tips" },
      { status: 500 }
    );
  }
}
