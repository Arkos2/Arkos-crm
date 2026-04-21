"use client";

import { useState, useCallback, useMemo } from "react";
import { QualifierConversation, BANTCollection } from "@/lib/types/agent";
import { ConversationList } from "@/components/agents/ConversationList";
import { ChatInterface } from "@/components/agents/ChatInterface";
import { BANTLiveMeter } from "@/components/agents/BANTLiveMeter";
import { Card, Badge, Button, EmptyState, Skeleton } from "@/components/ui";
import {
  Bot, MessageSquare, ArrowLeft, Plus, X,
  Building2, User, Phone, Mail,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useLeads } from "@/hooks/useLeads";
import { useMessages } from "@/hooks/useMessages";

const DEFAULT_BANT: BANTCollection = {
  budget: 0, authority: 0, need: 0, timeline: 0, total: 0,
};

// ─── MODAL NOVA CONVERSA ───
interface NewConvModalProps {
  onConfirm: (data: { name: string; company: string; email: string; phone: string; channel: string }) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

function NewConversationModal({ onConfirm, onClose, isSubmitting }: NewConvModalProps) {
  const [form, setForm] = useState({
    name: "", company: "", email: "", phone: "", channel: "webchat",
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-arkos-surface border border-arkos-border rounded-2xl shadow-arkos-lg animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-arkos-border">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-arkos-gold" />
            <h3 className="text-sm font-semibold text-text-primary">
              Nova Conversa de Qualificação
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-arkos-surface-2 text-text-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-4">
          {[
            { key: "name", label: "Nome do Lead *", icon: User, placeholder: "João da Silva" },
            { key: "company", label: "Empresa", icon: Building2, placeholder: "Empresa LTDA" },
            { key: "email", label: "E-mail", icon: Mail, placeholder: "joao@empresa.com" },
            { key: "phone", label: "Telefone / WhatsApp", icon: Phone, placeholder: "(11) 99999-9999" },
          ].map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-medium text-text-secondary mb-1.5 flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </label>
              <input
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full h-9 px-3 rounded-lg text-sm bg-arkos-bg border border-arkos-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arkos-blue transition-all"
              />
            </div>
          ))}

          {/* Canal */}
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">
              Canal
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "webchat", label: "🌐 Chat" },
                { id: "whatsapp", label: "💬 WhatsApp" },
                { id: "manual", label: "✍️ Manual" },
              ].map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setForm((prev) => ({ ...prev, channel: ch.id }))}
                  className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                    form.channel === ch.id
                      ? "bg-arkos-blue/10 border-arkos-blue/40 text-arkos-blue-light"
                      : "bg-arkos-bg border-arkos-border text-text-muted hover:border-arkos-border-2"
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 pb-5">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="gold"
            fullWidth
            disabled={!form.name || isSubmitting}
            loading={isSubmitting}
            onClick={() => onConfirm(form)}
            icon={<Bot className="h-4 w-4" />}
          >
            Iniciar Qualificação
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ───
export default function QualifierPage() {
  const { leads, addLead, isLoading: leadsLoading } = useLeads();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook de mensagens para o lead selecionado
  const { messages: dbMessages, refreshMessages } = useMessages(selectedId || undefined);

  // Mapeamento Lead DB -> UI Conversation
  const conversations: QualifierConversation[] = useMemo(() => {
    return leads.map(l => ({
      id: l.id,
      leadName: l.nome,
      leadEmail: l.email,
      leadPhone: l.telefone,
      company: l.empresa,
      channel: "webchat", // Padronizado por enquanto
      status: l.status === 'Qualificado' ? 'qualified' : 
              l.status === 'Descartado' ? 'disqualified' : 'active',
      bant: { ...DEFAULT_BANT, total: l.score_ia || 0 },
      messages: dbMessages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.created_at,
        isAI: m.role === 'assistant',
      })),
      createdAt: l.created_at,
      updatedAt: l.updated_at,
    }));
  }, [leads, dbMessages]);

  const selectedConv = conversations.find((c) => c.id === selectedId) || null;

  const handleUpdate = useCallback(
    (updates: Partial<QualifierConversation>) => {
      // Sincronização offline/refresh local se necessário
      refreshMessages();
    },
    [refreshMessages]
  );

  const handleNewConversation = async (data: {
    name: string; company: string; email: string; phone: string; channel: string;
  }) => {
    setIsSubmitting(true);
    try {
      const newLead = await addLead({
        nome: data.name,
        empresa: data.company,
        email: data.email,
        telefone: data.phone,
        status: 'Em Qualificação'
      });
      setSelectedId(newLead.id);
      setShowNewModal(false);
      toast.success(`Conversa iniciada com ${data.name}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateDeal = (conv: QualifierConversation) => {
    toast.success(`Negócio criado para ${conv.leadName}!`, {
      description: `BANT: ${conv.bant.total}/100 — Redirecionando para o Pipeline...`,
    });
    // Aqui integraria com DealService.createDeal
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
          <div className="p-2 rounded-xl bg-success/10 border border-success/20">
            <MessageSquare className="h-5 w-5 text-success" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-text-primary">Agente Qualificador</h1>
              <Badge variant="success" dot dotAnimate>Ativo</Badge>
            </div>
            <p className="text-xs text-text-muted">Qualificação BANT automatizada via Claude</p>
          </div>
        </div>
      </div>

      {/* ─── LAYOUT SPLIT ─── */}
      <div
        className="rounded-2xl border border-arkos-border overflow-hidden bg-arkos-surface"
        style={{ height: "calc(100vh - 200px)" }}
      >
        <div className="flex h-full">

          {/* Lista 30% */}
          <div className="w-72 shrink-0 h-full border-r border-arkos-border">
            {leadsLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
              </div>
            ) : (
              <ConversationList
                conversations={conversations}
                selectedId={selectedId || undefined}
                onSelect={(c) => setSelectedId(c.id)}
                onNew={() => setShowNewModal(true)}
              />
            )}
          </div>

          {/* Chat 45% */}
          <div className="flex-1 h-full border-r border-arkos-border bg-arkos-bg/30">
            {selectedConv ? (
              <ChatInterface
                key={selectedConv.id}
                conversation={selectedConv}
                onUpdate={handleUpdate}
                onCreateDeal={handleCreateDeal}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <EmptyState
                  icon={<MessageSquare className="h-8 w-8" />}
                  title="Selecione uma qualificação"
                  description="Escolha um lead da lista ou inicie uma nova conversa"
                  action={{
                    label: "Nova Qualificação",
                    onClick: () => setShowNewModal(true),
                  }}
                />
              </div>
            )}
          </div>

          {/* BANT Sidebar 25% */}
          <div className="w-64 shrink-0 h-full overflow-y-auto p-4 space-y-4 bg-arkos-surface">
            {selectedConv ? (
              <>
                <div>
                  <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
                    BANT Score IA
                  </h4>
                  <BANTLiveMeter bant={selectedConv.bant} />
                </div>

                {selectedConv.bant.total >= 70 && (
                  <Button
                    variant="gold"
                    fullWidth
                    icon={<Plus className="h-4 w-4" />}
                    onClick={() => handleCreateDeal(selectedConv)}
                  >
                    Criar no Pipeline
                  </Button>
                )}

                <Card padding="sm">
                  <h4 className="text-2xs font-semibold text-text-muted uppercase tracking-wide mb-3">
                    Info do Lead
                  </h4>
                  <div className="space-y-2">
                    {[
                      { label: "Lead", value: selectedConv.leadName },
                      { label: "Canal", value: selectedConv.channel },
                      {
                        label: "Status",
                        value: selectedConv.status === "active" ? "Qualificando"
                          : selectedConv.status === "qualified" ? "Qualificado"
                          : selectedConv.status === "disqualified" ? "Descartado"
                          : selectedConv.status,
                      },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-2xs text-text-muted">{label}</span>
                        <span className="text-2xs font-medium text-text-secondary capitalize">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <Bot className="h-8 w-8 text-text-muted mb-3" />
                <p className="text-xs text-text-muted">
                  O BANT Score é calculado em tempo real pela IA durante a conversa
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal nova conversa */}
      {showNewModal && (
        <NewConversationModal
          onConfirm={handleNewConversation}
          onClose={() => setShowNewModal(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
