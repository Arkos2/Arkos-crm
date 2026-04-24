"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDeals } from "@/hooks/useDeals";
import { getOrganizations, OrganizationRow } from "@/lib/supabase/services/organizations";
import { getContacts, ContactRow } from "@/lib/supabase/services/contacts";
import { getDefaultPipeline } from "@/lib/supabase/services/pipelines";
import { Button, Input, Badge } from "@/components/ui";
import { X, Search, Building2, User, DollarSign, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NewDealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewDealModal({ isOpen, onClose }: NewDealModalProps) {
  const { user, supabaseUser } = useAuth();
  const { createDeal } = useDeals();
  
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Seleção de Organização
  const [orgSearch, setOrgSearch] = useState("");
  const [orgs, setOrgs] = useState<OrganizationRow[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationRow | null>(null);
  
  // Seleção de Contato
  const [contactSearch, setContactSearch] = useState("");
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactRow | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    if (isOpen) {
      loadOrgs();
      loadContacts();
    }
  }, [isOpen]);

  const loadOrgs = async (search?: string) => {
    try {
      const data = await getOrganizations(search);
      setOrgs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadContacts = async (search?: string) => {
    try {
      const data = await getContacts(search);
      setContacts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeUser = user || supabaseUser;
    
    if (!activeUser) {
      toast.error("Você precisa estar logado.");
      return;
    }

    if (!title) {
      toast.error("Informe um título para o negócio.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Criando negócio...");

    try {
      const pipeline = await getDefaultPipeline();
      if (!pipeline) throw new Error("Nenhum pipeline encontrado.");

      await createDeal({
        title,
        value: parseFloat(value) || 0,
        pipelineId: pipeline.id,
        organizationId: selectedOrg?.id,
        contactId: selectedContact?.id,
        ownerId: activeUser.id,
      });

      toast.success("Negócio criado com sucesso!", { id: toastId });
      onClose();
      // Reset form
      setTitle("");
      setValue("");
      setSelectedOrg(null);
      setSelectedContact(null);
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao criar negócio", { 
        id: toastId,
        description: err.message 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-arkos-bg/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-arkos-surface border border-arkos-border rounded-2xl shadow-arkos-lg overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-arkos-border flex items-center justify-between bg-arkos-surface-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-arkos-gold/10 text-arkos-gold">
              <Briefcase className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Novo Negócio</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-arkos-surface-3 text-text-muted hover:text-text-primary transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Título e Valor */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary ml-1">Título do Negócio</label>
              <Input
                placeholder="Ex: Consultoria Arkos"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary ml-1">Valor (R$)</label>
              <div className="relative">
                < DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                <Input
                  className="pl-8"
                  type="number"
                  placeholder="0,00"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Seleção de Empresa */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary ml-1">Empresa</label>
            {selectedOrg ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-arkos-blue/5 border border-arkos-blue/20">
                <div className="flex items-center gap-2 text-sm text-text-primary">
                  <Building2 className="h-4 w-4 text-arkos-blue-light" />
                  <span className="font-medium">{selectedOrg.name}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedOrg(null)}
                  className="text-2xs text-danger hover:underline"
                >
                  Remover
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                <Input
                  className="pl-8"
                  placeholder="Buscar empresa..."
                  value={orgSearch}
                  onChange={(e) => {
                    setOrgSearch(e.target.value);
                    loadOrgs(e.target.value);
                  }}
                />
                {orgSearch && orgs.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-arkos-surface-3 border border-arkos-border rounded-xl shadow-arkos-lg z-10 max-h-40 overflow-y-auto">
                    {orgs.map((org) => (
                      <button
                        key={org.id}
                        type="button"
                        onClick={() => {
                          setSelectedOrg(org);
                          setOrgSearch("");
                        }}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-arkos-surface-2 transition-colors border-b border-arkos-border last:border-0"
                      >
                        {org.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Seleção de Contato */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary ml-1">Contato</label>
            {selectedContact ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-arkos-gold/5 border border-arkos-gold/20">
                <div className="flex items-center gap-2 text-sm text-text-primary">
                  <User className="h-4 w-4 text-arkos-gold" />
                  <span className="font-medium">{selectedContact.first_name} {selectedContact.last_name}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedContact(null)}
                  className="text-2xs text-danger hover:underline"
                >
                  Remover
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                <Input
                  className="pl-8"
                  placeholder="Buscar contato..."
                  value={contactSearch}
                  onChange={(e) => {
                    setContactSearch(e.target.value);
                    loadContacts(e.target.value);
                  }}
                />
                {contactSearch && contacts.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-arkos-surface-3 border border-arkos-border rounded-xl shadow-arkos-lg z-10 max-h-40 overflow-y-auto">
                    {contacts.map((contact) => (
                      <button
                        key={contact.id}
                        type="button"
                        onClick={() => {
                          setSelectedContact(contact);
                          setContactSearch("");
                        }}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-arkos-surface-2 transition-colors border-b border-arkos-border last:border-0"
                      >
                        <div className="font-medium">{contact.first_name} {contact.last_name}</div>
                        <div className="text-2xs text-text-muted">{contact.email || contact.phone}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button 
              type="button"
              variant="ghost" 
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              variant="primary" 
              loading={loading}
            >
              Criar Negócio
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
