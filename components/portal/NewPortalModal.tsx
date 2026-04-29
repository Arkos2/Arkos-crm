"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { X, Building2, Briefcase, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface NewPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewPortalModal({ isOpen, onClose, onSuccess }: NewPortalModalProps) {
  const { user, supabaseUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    projectName: "",
    expectedEndDate: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.projectName || !formData.expectedEndDate) {
      toast.error("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Criando portal do cliente...");

    try {
      // Mocked implementation for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Portal criado com sucesso!", { id: toastId });
      onSuccess?.();
      onClose();
      setFormData({ companyName: "", projectName: "", expectedEndDate: "" });
    } catch (err: any) {
      toast.error("Erro ao criar portal", { id: toastId, description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-arkos-bg/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-arkos-surface border border-arkos-border rounded-2xl shadow-arkos-lg overflow-hidden animate-scale-in">
        <div className="px-6 py-4 border-b border-arkos-border flex items-center justify-between bg-arkos-surface-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-arkos-gold/10 text-arkos-gold">
              <Building2 className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Novo Portal</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-arkos-surface-3 text-text-muted transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary ml-1">Empresa Cliente</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
              <Input
                className="pl-8"
                placeholder="Ex: Clínica Saúde"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                autoFocus
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary ml-1">Nome do Projeto</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
              <Input
                className="pl-8"
                placeholder="Ex: Implantação CRM"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary ml-1">Previsão de Conclusão</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
              <Input
                type="date"
                className="pl-8"
                value={formData.expectedEndDate}
                onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })}
              />
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Criar Portal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
