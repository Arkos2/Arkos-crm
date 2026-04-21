"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ContentType, GeneratedContent } from "@/lib/types/agent";
import { Button, Badge, Card, EmptyState } from "@/components/ui";
import {
  FileText, Mail, MessageSquare, Phone,
  Users, ArrowLeft, Bot, Copy, Send,
  RefreshCw, Check, Loader2, Sparkles,
  ChevronDown, Building2, DollarSign,
  Clock, Lightbulb, Download, Save,
  BookOpen, Zap,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// ─── CONFIGURAÇÃO DOS TIPOS DE CONTEÚDO ───
const CONTENT_TYPES: Array<{
  id: ContentType;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
  bg: string;
  border: string;
  fields: string[];
}> = [
  {
    id: "email_prospecting",
    label: "E-mail de Prospecção",
    icon: Mail,
    description: "Cold e-mail personalizado para primeiro contato",
    color: "text-info",
    bg: "bg-info/10",
    border: "border-info/20",
    fields: ["leadName", "company", "industry", "problem"],
  },
  {
    id: "email_followup",
    label: "E-mail de Follow-up",
    icon: RefreshCw,
    description: "Acompanhamento após contato anterior",
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
    fields: ["leadName", "company", "lastInteraction", "problem"],
  },
  {
    id: "email_post_meeting",
    label: "E-mail Pós-Reunião",
    icon: Users,
    description: "Resumo e próximos passos após reunião",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
    fields: ["leadName", "company", "notes", "dealValue"],
  },
  {
    id: "whatsapp_message",
    label: "Mensagem WhatsApp",
    icon: MessageSquare,
    description: "Mensagem profissional para WhatsApp Business",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
    fields: ["leadName", "company", "lastInteraction"],
  },
  {
    id: "call_script",
    label: "Script de Ligação",
    icon: Phone,
    description: "Roteiro estruturado para chamadas comerciais",
    color: "text-arkos-gold",
    bg: "bg-arkos-gold/10",
    border: "border-arkos-gold/20",
    fields: ["leadName", "company", "industry", "problem"],
  },
  {
    id: "meeting_summary",
    label: "Resumo de Reunião",
    icon: BookOpen,
    description: "Transcrição → resumo estruturado com IA",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    fields: ["leadName", "company", "notes"],
  },
];

const TONE_OPTIONS = [
  { id: "formal", label: "Formal", desc: "Corporativo e técnico" },
  { id: "professional", label: "Profissional", desc: "Equilibrado e empático" },
  { id: "casual", label: "Casual", desc: "Leve e conversacional" },
] as const;

// ─── HISTÓRICO MOCK ───
const HISTORY_MOCK: GeneratedContent[] = [
  {
    id: "gc-001",
    type: "email_prospecting",
    title: "Prospecção — TechCorp Brasil",
    content: "",
    tone: "professional",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    tokensUsed: 312,
  },
  {
    id: "gc-002",
    type: "call_script",
    title: "Script — LogiMax COO",
    content: "",
    tone: "formal",
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    tokensUsed: 487,
  },
  {
    id: "gc-003",
    type: "email_post_meeting",
    title: "Pós-reunião — SaúdeTec",
    content: "",
    tone: "professional",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    tokensUsed: 398,
  },
];

// ─── RENDERER DE CONTEÚDO ───
function ContentRenderer({
  content,
  contentType,
}: {
  content: Record<string, unknown>;
  contentType: ContentType;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success("Copiado para a área de transferência!");
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyBtn = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => copyToClipboard(text, field)}
      className="p-1.5 rounded-lg hover:bg-arkos-surface-3 text-text-muted hover:text-text-primary transition-all"
      title="Copiar"
    >
      {copied === field ? (
        <Check className="h-3.5 w-3.5 text-success" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );

  // ─── E-MAIL ───
  if (
    contentType === "email_prospecting" ||
    contentType === "email_followup" ||
    contentType === "email_post_meeting"
  ) {
    const subject = content.subject as string;
    const body = content.body as string;

    return (
      <div className="space-y-4">
        {/* Assunto */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Assunto
            </label>
            <CopyBtn text={subject} field="subject" />
          </div>
          <div className="px-4 py-3 rounded-xl bg-arkos-surface-3 border border-arkos-border">
            <p className="text-sm font-semibold text-text-primary">{subject}</p>
          </div>
        </div>

        {/* Corpo */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Corpo do E-mail
            </label>
            <div className="flex items-center gap-1">
              <CopyBtn text={body} field="body" />
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-arkos-blue/10 border border-arkos-blue/20 text-2xs font-medium text-arkos-blue-light hover:bg-arkos-blue/20 transition-all">
                <Send className="h-3 w-3" />
                Enviar
              </button>
            </div>
          </div>
          <div className="px-4 py-4 rounded-xl bg-arkos-bg border border-arkos-border min-h-[200px]">
            <div className="text-sm text-text-primary leading-relaxed whitespace-pre-line">
              {body}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── WHATSAPP ───
  if (contentType === "whatsapp_message") {
    const body = content.body as string;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
            Mensagem WhatsApp
          </label>
          <div className="flex items-center gap-1">
            <CopyBtn text={body} field="body" />
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20 text-2xs font-medium text-success hover:bg-success/20 transition-all">
              <MessageSquare className="h-3 w-3" />
              Abrir WhatsApp
            </button>
          </div>
        </div>

        {/* Preview estilo WhatsApp */}
        <div className="rounded-2xl bg-[#111b21] p-4">
          <div className="flex justify-end">
            <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-tr-sm bg-[#005c4b] text-sm text-white leading-relaxed whitespace-pre-line">
              {body}
              <span className="block text-right text-[10px] text-green-300 mt-1 opacity-60">
                agora ✓✓
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── SCRIPT DE LIGAÇÃO ───
  if (contentType === "call_script") {
    const title = content.title as string;
    const cards = content.cards as Array<{
      section: string;
      duration: string;
      content: string;
      tips: string[];
    }>;

    if (!cards) return <div className="text-sm text-text-secondary">Erro ao renderizar script.</div>;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-text-primary">{title}</h4>
          <CopyBtn
            text={cards.map((c) => `## ${c.section}\n${c.content}`).join("\n\n")}
            field="script"
          />
        </div>

        {cards.map((card, i) => (
          <div
            key={i}
            className="rounded-xl border border-arkos-border bg-arkos-surface-2 overflow-hidden"
          >
            {/* Header do card */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-arkos-surface-3 border-b border-arkos-border">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-arkos-gold/10 border border-arkos-gold/20 flex items-center justify-center text-2xs font-bold text-arkos-gold">
                  {i + 1}
                </span>
                <span className="text-xs font-semibold text-text-primary">
                  {card.section}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-2xs text-text-muted">
                <Clock className="h-3 w-3" />
                {card.duration}
              </div>
            </div>

            {/* Conteúdo */}
            <div className="px-4 py-3">
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {card.content}
              </p>

              {/* Tips */}
              {card.tips && card.tips.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {card.tips.map((tip, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <Lightbulb className="h-3.5 w-3.5 text-arkos-gold shrink-0 mt-0.5" />
                      <span className="text-2xs text-text-muted">{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── RESUMO DE REUNIÃO ───
  if (contentType === "meeting_summary") {
    const summary = content.executiveSummary as string;
    const keyPoints = content.keyPoints as string[];
    const nextSteps = content.nextSteps as Array<{
      action: string;
      owner: string;
      deadline: string;
    }>;
    const riskFlags = content.riskFlags as string[];
    const temperature = content.temperature as string;
    const bantUpdate = content.bantUpdate as {
      budget: number;
      authority: number;
      need: number;
      timeline: number;
      notes: string;
    };

    return (
      <div className="space-y-4">
        {/* Resumo executivo */}
        <div className="px-4 py-3 rounded-xl bg-arkos-blue/5 border border-arkos-blue/20">
          <p className="text-xs font-semibold text-arkos-blue-light mb-1.5">
            Resumo Executivo
          </p>
          <p className="text-sm text-text-primary leading-relaxed">{summary}</p>

          {temperature && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xs text-text-muted">Temperatura:</span>
              <Badge
                variant={
                  temperature === "hot"
                    ? "danger"
                    : temperature === "warm"
                    ? "warning"
                    : "info"
                }
                size="sm"
              >
                {temperature === "hot"
                  ? "🔥 Quente"
                  : temperature === "warm"
                  ? "⚡ Morno"
                  : "❄️ Frio"}
              </Badge>
            </div>
          )}
        </div>

        {/* Pontos-chave */}
        {keyPoints?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Pontos-Chave
            </h4>
            {keyPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-arkos-surface-2">
                <div className="w-1.5 h-1.5 rounded-full bg-arkos-gold mt-1.5 shrink-0" />
                <p className="text-sm text-text-secondary">{point}</p>
              </div>
            ))}
          </div>
        )}

        {/* Próximos passos */}
        {nextSteps?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Próximos Passos
            </h4>
            {nextSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-success/5 border border-success/20">
                <div className="w-5 h-5 rounded-full border-2 border-success/40 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-2xs font-bold text-success">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{step.action}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-2xs text-text-muted">
                      👤 {step.owner}
                    </span>
                    <span className="text-2xs text-text-muted">
                      📅 {step.deadline}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BANT Update */}
        {bantUpdate && (
          <div className="px-4 py-3 rounded-xl bg-arkos-gold/5 border border-arkos-gold/20">
            <p className="text-xs font-semibold text-arkos-gold mb-2">
              Atualização BANT Sugerida
            </p>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[
                { key: "budget", label: "B" },
                { key: "authority", label: "A" },
                { key: "need", label: "N" },
                { key: "timeline", label: "T" },
              ].map(({ key, label }) => (
                <div key={key} className="text-center">
                  <p className="text-2xs text-text-muted">{label}</p>
                  <p className="text-base font-bold text-arkos-gold">
                    {bantUpdate[key as keyof typeof bantUpdate] as number}
                  </p>
                </div>
              ))}
            </div>
            {bantUpdate.notes && (
              <p className="text-2xs text-text-secondary italic">{bantUpdate.notes}</p>
            )}
            <Button variant="gold" size="xs" className="mt-2 w-full">
              Aplicar no Pipeline
            </Button>
          </div>
        )}

        {/* Riscos */}
        {riskFlags?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Alertas de Risco
            </h4>
            {riskFlags.map((risk, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-danger/5 border border-danger/20">
                <span className="text-sm">⚠️</span>
                <p className="text-xs text-danger">{risk}</p>
              </div>
            ))}
          </div>
        )}

        {/* Ações finais */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Save className="h-3.5 w-3.5" />}
            fullWidth
          >
            Salvar na Timeline
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Send className="h-3.5 w-3.5" />}
            fullWidth
          >
            Enviar por E-mail
          </Button>
        </div>
      </div>
    );
  }

  return (
    <pre className="text-xs text-text-secondary whitespace-pre-wrap">
      {JSON.stringify(content, null, 2)}
    </pre>
  );
}

// ─── PÁGINA PRINCIPAL ───
export default function WriterPage() {
  const [selectedType, setSelectedType] = useState<ContentType>("email_prospecting");
  const [tone, setTone] = useState<"formal" | "professional" | "casual">("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Record<string, unknown> | null>(null);
  const [history, setHistory] = useState<GeneratedContent[]>(HISTORY_MOCK);

  const [context, setContext] = useState({
    leadName: "",
    company: "",
    industry: "",
    lastInteraction: "",
    dealValue: "",
    problem: "",
    desiredState: "",
    notes: "",
  });

  const selectedConfig = CONTENT_TYPES.find((c) => c.id === selectedType)!;

  const handleGenerate = async () => {
    if (!context.leadName && !context.company) {
      toast.error("Preencha pelo menos o nome do lead ou empresa");
      return;
    }

    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      const res = await fetch("/api/agents/writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: selectedType,
          tone,
          context: {
            ...context,
            dealValue: context.dealValue ? Number(context.dealValue) : undefined,
          },
        }),
      });

      if (!res.ok) throw new Error("Erro na API");

      const data = await res.json();
      setGeneratedContent(data);

      // Adicionar ao histórico
      const newEntry: GeneratedContent = {
        id: `gc-${Date.now()}`,
        type: selectedType,
        title: `${selectedConfig.label} — ${context.company || context.leadName}`,
        content: JSON.stringify(data),
        tone,
        createdAt: new Date().toISOString(),
        tokensUsed: data.tokensUsed,
      };
      setHistory((prev) => [newEntry, ...prev.slice(0, 9)]);

      toast.success("Conteúdo gerado com sucesso!");
    } catch {
      toast.error("Erro ao gerar conteúdo. Verifique sua API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">

      {/* ─── HEADER ─── */}
      <div className="flex items-center gap-3">
        <Link href="/agents">
          <button className="p-2 rounded-xl hover:bg-arkos-surface-2 text-text-muted hover:text-text-primary transition-all">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-arkos-gold/10 border border-arkos-gold/20">
            <FileText className="h-5 w-5 text-arkos-gold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-text-primary">
                Agente Redator
              </h1>
              <Badge variant="gold" dot dotAnimate>Ativo</Badge>
            </div>
            <p className="text-xs text-text-muted">
              Geração de conteúdo comercial com IA
            </p>
          </div>
        </div>
      </div>

      {/* ─── LAYOUT 3 COLUNAS ─── */}
      <div className="grid grid-cols-12 gap-4" style={{ minHeight: "calc(100vh - 200px)" }}>

        {/* ─── COL 1: SELEÇÃO + CONTEXTO (4 cols) ─── */}
        <div className="col-span-12 lg:col-span-4 space-y-4">

          {/* Tipo de conteúdo */}
          <Card padding="sm">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
              Tipo de Conteúdo
            </h3>
            <div className="space-y-1.5">
              {CONTENT_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id);
                      setGeneratedContent(null);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
                      "border transition-all duration-200 text-left",
                      isSelected
                        ? cn(type.bg, type.border, "shadow-sm")
                        : "border-transparent hover:bg-arkos-surface-2 hover:border-arkos-border"
                    )}
                  >
                    <div className={cn("p-1.5 rounded-lg shrink-0", isSelected ? type.bg : "bg-arkos-surface-3")}>
                      <Icon className={cn("h-3.5 w-3.5", isSelected ? type.color : "text-text-muted")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-semibold", isSelected ? "text-text-primary" : "text-text-secondary")}>
                        {type.label}
                      </p>
                      <p className="text-2xs text-text-muted truncate">{type.description}</p>
                    </div>
                    {isSelected && (
                      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", type.color.replace("text-", "bg-"))} />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Contexto */}
          <Card padding="sm">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
              Contexto do Lead
            </h3>
            <div className="space-y-3">
              {[
                { key: "leadName", label: "Nome do Lead", icon: Users, placeholder: "Carlos Mendes", required: true },
                { key: "company", label: "Empresa", icon: Building2, placeholder: "TechCorp Brasil" },
                { key: "industry", label: "Setor", icon: Zap, placeholder: "Tecnologia, Saúde..." },
                { key: "lastInteraction", label: "Último Contato", icon: Clock, placeholder: "Reunião de diagnóstico..." },
                { key: "dealValue", label: "Valor Estimado (R$)", icon: DollarSign, placeholder: "45000" },
                { key: "problem", label: "Problema Identificado", icon: Lightbulb, placeholder: "Processos manuais causando..." },
                { key: "desiredState", label: "Estado Desejado", icon: Check, placeholder: "Automatizar e ter dashboards..." },
              ].map(({ key, label, icon: Icon, placeholder, required }) => (
                <div key={key}>
                  <label className="text-2xs font-medium text-text-muted mb-1 flex items-center gap-1">
                    <Icon className="h-3 w-3" />
                    {label}
                    {required && <span className="text-danger">*</span>}
                  </label>
                  <input
                    value={context[key as keyof typeof context]}
                    onChange={(e) => setContext((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full h-8 px-3 rounded-lg text-xs bg-arkos-bg border border-arkos-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arkos-blue transition-all"
                  />
                </div>
              ))}

              {/* Notas (para scripts e resumos) */}
              {["call_script", "meeting_summary", "email_post_meeting"].includes(selectedType) && (
                <div>
                  <label className="text-2xs font-medium text-text-muted mb-1 flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {selectedType === "meeting_summary" ? "Notas / Transcrição" : "Notas Adicionais"}
                  </label>
                  <textarea
                    value={context.notes}
                    onChange={(e) => setContext((p) => ({ ...p, notes: e.target.value }))}
                    placeholder={
                      selectedType === "meeting_summary"
                        ? "Cole aqui a transcrição ou notas da reunião..."
                        : "Informações adicionais relevantes..."
                    }
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-arkos-bg border border-arkos-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arkos-blue transition-all resize-none"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Tom */}
          <Card padding="sm">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
              Tom da Comunicação
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {TONE_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={cn(
                    "py-2.5 px-2 rounded-xl border text-center transition-all",
                    tone === t.id
                      ? "bg-arkos-blue/10 border-arkos-blue/40 text-arkos-blue-light"
                      : "border-arkos-border text-text-muted hover:border-arkos-border-2 hover:text-text-secondary"
                  )}
                >
                  <p className="text-xs font-semibold">{t.label}</p>
                  <p className="text-2xs mt-0.5 leading-tight">{t.desc}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Botão gerar */}
          <Button
            variant="gold"
            size="lg"
            fullWidth
            loading={isGenerating}
            onClick={handleGenerate}
            icon={<Sparkles className="h-4 w-4" />}
          >
            {isGenerating ? "Gerando com Claude..." : "Gerar Conteúdo"}
          </Button>
        </div>

        {/* ─── COL 2: RESULTADO (5 cols) ─── */}
        <div className="col-span-12 lg:col-span-5">
          <Card className="h-full" padding="md">
            {/* Header da área de resultado */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-arkos-border">
              <div className="flex items-center gap-2">
                <div className={cn("p-1.5 rounded-lg", selectedConfig.bg)}>
                  {(() => {
                    const Icon = selectedConfig.icon;
                    return <Icon className={cn("h-4 w-4", selectedConfig.color)} />;
                  })()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {selectedConfig.label}
                  </p>
                  <p className="text-2xs text-text-muted">
                    Tom: {TONE_OPTIONS.find((t) => t.id === tone)?.label}
                  </p>
                </div>
              </div>

              {generatedContent && (
                <div className="flex items-center gap-1">
                  <Badge variant="success" size="sm" dot>
                    Gerado
                  </Badge>
                  <button
                    onClick={handleGenerate}
                    className="p-1.5 rounded-lg hover:bg-arkos-surface-2 text-text-muted hover:text-text-primary transition-all"
                    title="Regenerar"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Conteúdo */}
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-arkos-gold/10 border border-arkos-gold/20 flex items-center justify-center">
                    <Bot className="h-8 w-8 text-arkos-gold" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-arkos-gold/20 border border-arkos-gold/40 flex items-center justify-center">
                    <Loader2 className="h-3 w-3 text-arkos-gold animate-spin" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-text-primary">
                    Claude está criando...
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Analisando contexto e gerando conteúdo personalizado
                  </p>
                </div>
                {/* Loading dots */}
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-arkos-gold/40 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            ) : generatedContent ? (
              <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 340px)" }}>
                <ContentRenderer
                  content={generatedContent}
                  contentType={selectedType}
                />
              </div>
            ) : (
              <EmptyState
                icon={<Sparkles className="h-8 w-8" />}
                title="Pronto para criar"
                description="Preencha o contexto e clique em Gerar Conteúdo"
                size="md"
              />
            )}
          </Card>
        </div>

        {/* ─── COL 3: HISTÓRICO (3 cols) ─── */}
        <div className="col-span-12 lg:col-span-3 space-y-3">
          <Card padding="sm">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
              Gerado Recentemente
            </h3>
            <div className="space-y-2">
              {history.map((item) => {
                const typeConfig = CONTENT_TYPES.find((c) => c.id === item.type);
                if (!typeConfig) return null;
                const Icon = typeConfig.icon;

                return (
                  <button
                    key={item.id}
                    className="w-full flex items-start gap-3 p-3 rounded-xl border border-arkos-border hover:border-arkos-blue/30 hover:bg-arkos-surface-2 transition-all text-left group"
                  >
                    <div className={cn("p-1.5 rounded-lg shrink-0", typeConfig.bg)}>
                      <Icon className={cn("h-3.5 w-3.5", typeConfig.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-2xs font-semibold text-text-primary truncate">
                        {item.title}
                      </p>
                      <p className="text-2xs text-text-muted mt-0.5">
                        {item.tone} · {item.tokensUsed} tokens
                      </p>
                      <p className="text-2xs text-text-muted">
                        {new Date(item.createdAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Download className="h-3.5 w-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Dicas de uso */}
          <Card padding="sm" className="border-arkos-gold/20 bg-arkos-gold/5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-arkos-gold" />
              <h3 className="text-xs font-semibold text-arkos-gold">
                Dica do Agente
              </h3>
            </div>
            <div className="space-y-2 text-2xs text-text-secondary leading-relaxed">
              {selectedType === "email_prospecting" && (
                <p>
                  📈 E-mails com <strong className="text-text-primary">assunto personalizado</strong> têm
                  taxa de abertura 3x maior. Quanto mais contexto da empresa, melhor.
                </p>
              )}
              {selectedType === "email_followup" && (
                <p>
                  ⚡ O <strong className="text-text-primary">melhor timing</strong> para follow-up é
                  48-72h após o último contato. Adicione sempre um novo valor.
                </p>
              )}
              {selectedType === "call_script" && (
                <p>
                  🎯 Use o script como <strong className="text-text-primary">guia, não roteiro</strong>.
                  Adapte às respostas. Foque nas perguntas, não no monólogo.
                </p>
              )}
              {selectedType === "meeting_summary" && (
                <p>
                  📝 Envie o resumo em <strong className="text-text-primary">até 2h após a reunião</strong>.
                  Demonstra profissionalismo e alinha expectativas.
                </p>
              )}
              {selectedType === "whatsapp_message" && (
                <p>
                  💬 WhatsApp tem <strong className="text-text-primary">98% de taxa de abertura</strong>.
                  Seja direto e use no máximo 3 parágrafos curtos.
                </p>
              )}
              {selectedType === "email_post_meeting" && (
                <p>
                  ✅ Confirme <strong className="text-text-primary">próximos passos com datas</strong>.
                  Leads que recebem next steps claros fecham 60% mais.
                </p>
              )}
            </div>
          </Card>

          {/* Stats de hoje */}
          <Card padding="sm">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
              Hoje
            </h3>
            <div className="space-y-2">
              {[
                { label: "Conteúdos gerados", value: history.length },
                { label: "Tokens usados", value: `${history.reduce((s, h) => s + (h.tokensUsed || 0), 0).toLocaleString()}` },
                { label: "Taxa de uso", value: "84%" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-2xs text-text-muted">{label}</span>
                  <span className="text-xs font-bold text-text-primary">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
