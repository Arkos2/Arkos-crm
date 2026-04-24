"use client";

import { useState } from "react";
import { OutboundSearchQuery, Prospect, CompanySize } from "@/lib/types/prospector";
import { cn } from "@/lib/utils";
import { Button, Badge, Card } from "@/components/ui";
import {
  Search, Plus, X, Loader2, Bot,
  Sliders, ChevronDown, ChevronUp,
  RefreshCw, Download,
} from "lucide-react";
import { ProspectCard } from "./ProspectCard";
import { toast } from "sonner";

const INDUSTRIES = [
  "Odontologia Premium", "Cirurgia Plástica", "Capilar", "Estética Avançada",
  "Saúde", "Tecnologia", "Serviços",
];

const SIZES: Array<{ id: CompanySize; label: string; desc: string }> = [
  { id: "micro", label: "Micro", desc: "1-9" },
  { id: "small", label: "Pequena", desc: "10-49" },
  { id: "medium", label: "Média", desc: "50-199" },
  { id: "large", label: "Grande", desc: "200+" },
  { id: "enterprise", label: "Enterprise", desc: "1000+" },
];

const ROLES = [
  "CEO", "COO", "CFO", "CTO",
  "Diretor Comercial", "Diretor Financeiro",
  "Diretor de TI", "Diretor Operacional",
  "Gerente Comercial", "Gerente de TI",
];

const LOCATIONS = [
  "São Paulo", "Rio de Janeiro", "Minas Gerais",
  "Rio Grande do Sul", "Paraná", "Bahia",
  "Brasil (todos os estados)",
];

interface OutboundSearchProps {
  onConvert?: (prospect: Prospect) => void;
}

export function OutboundSearch({ onConvert }: OutboundSearchProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "niche" | "history">("basic");
  const [query, setQuery] = useState<OutboundSearchQuery>({
    industries: ["Odontologia Premium"],
    sizes: ["small", "medium"],
    roles: ["CEO", "Diretor"],
    locations: ["São Paulo"],
    painPoints: ["processos manuais"],
    keywords: [],
    limit: 8,
    nicheDescription: "",
    icpDetails: "",
  });

  const [results, setResults] = useState<Prospect[]>([]);
  const [history, setHistory] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("arkos_prospector_history");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newPain, setNewPain] = useState("");

  const toggleItem = <T extends string>(
    arr: T[],
    item: T,
    setter: (val: T[]) => void
  ) => {
    setter(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
  };

  const handleSearch = async () => {
    if (query.industries.length === 0) {
      toast.error("Selecione pelo menos um setor");
      return;
    }

    setIsSearching(true);
    setResults([]);
    setHasSearched(true);

    try {
      const savedSettings = localStorage.getItem("arkos_ai_settings");
      const aiConfig = savedSettings ? JSON.parse(savedSettings) : {};

      const res = await fetch("/api/agents/prospector/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query,
          config: {
            model: aiConfig.model,
            temperature: aiConfig.temperature
          }
        }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      const newResults = data.prospects || [];
      setResults(newResults);
      
      // Salvar no histórico
      const newHistoryItem = {
        id: Date.now().toString(),
        query: { ...query },
        results: newResults,
        timestamp: new Date().toISOString(),
      };
      const updatedHistory = [newHistoryItem, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem("arkos_prospector_history", JSON.stringify(updatedHistory));

      toast.success(
        `${newResults.length} empresas encontradas com IA!`,
        {
          description: `Tokens usados: ${data.tokensUsed || 0}`,
        }
      );
    } catch {
      toast.error("Erro ao buscar prospects. Verifique a API key.");
    } finally {
      setIsSearching(false);
    }
  };

  const applyNichePreset = (niche: string, icp: string) => {
    setQuery(p => ({
      ...p,
      nicheDescription: niche,
      icpDetails: icp,
      industries: [niche.includes("Odontologia") ? "Odontologia Premium" : "Cirurgia Plástica"],
    }));
    setActiveTab("niche");
    toast.info("Preset aplicado: " + niche);
  };

  const handleLocalConvert = async (prospect: Prospect) => {
    if (!onConvert) return;
    
    // Chamar a funo real (que salva no banco)
    await (onConvert(prospect) as any);
    
    // Atualizar o estado local para desativar o boto no card
    setResults(prev => prev.map(p => 
      p.id === prospect.id ? { ...p, status: "converted" } : p
    ));
  };

  const highPriority = results.filter(
    (p) => p.fitScore?.recommendation === "high_priority"
  ).length;

  return (
    <div className="space-y-5">
      
      {/* ─── ABAS DE NAVEGAÇÃO ─── */}
      <div className="flex p-1 bg-arkos-bg-secondary/50 rounded-2xl border border-arkos-border w-fit">
        <button
          onClick={() => setActiveTab("basic")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-semibold transition-all",
            activeTab === "basic" ? "bg-arkos-blue text-white shadow-lg" : "text-text-muted hover:text-text-secondary"
          )}
        >
          Busca Rápida
        </button>
        <button
          onClick={() => setActiveTab("niche")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-semibold transition-all",
            activeTab === "niche" ? "bg-arkos-gold text-white shadow-lg" : "text-text-muted hover:text-text-secondary"
          )}
        >
          Nicho & ICP
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-semibold transition-all",
            activeTab === "history" ? "bg-white/10 text-white" : "text-text-muted hover:text-text-secondary"
          )}
        >
          Histórico Outbound
        </button>
      </div>

      <Card>
        <div className="space-y-6">
          
          {activeTab === "basic" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Setores */}
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3 block">
                  Setores Alvo *
                </label>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map((ind) => {
                    const selected = query.industries.includes(ind);
                    return (
                      <button
                        key={ind}
                        onClick={() => toggleItem(query.industries, ind, (v) => setQuery((p) => ({ ...p, industries: v })))}
                        className={cn(
                          "px-3 py-2 rounded-xl border text-xs font-medium transition-all",
                          selected
                            ? "bg-arkos-blue/10 border-arkos-blue/40 text-arkos-blue-light"
                            : "border-arkos-border text-text-muted hover:border-arkos-blue/30"
                        )}
                      >
                        {selected && "✓ "}{ind}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Localização Multi-Seleção */}
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3 block">
                  Regiões de Atuação (Multi-seleção)
                </label>
                <div className="flex flex-wrap gap-2">
                  {LOCATIONS.map((loc) => {
                    const selected = query.locations.includes(loc);
                    return (
                      <button
                        key={loc}
                        onClick={() => toggleItem(query.locations, loc, (v) => setQuery((p) => ({ ...p, locations: v })))}
                        className={cn(
                          "px-3 py-2 rounded-xl border text-xs font-medium transition-all",
                          selected
                            ? "bg-success/10 border-success/40 text-success"
                            : "border-arkos-border text-text-muted hover:border-success/30"
                        )}
                      >
                        {selected && "📍 "}{loc}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Presets Rápidos */}
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3 block">
                  Sugestões de Nicho
                </label>
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => applyNichePreset("Odontologia Premium", "Clínicas focadas em Reabilitação Estética e Funcional (Lentes de Porcelana, Implante Protocolo, Invisalign) com alto ticket médio.")}
                  >
                    🦷 Odonto Premium
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => applyNichePreset("Cirurgia Plástica", "Clínicas focadas em procedimentos de alto ticket como Lipo HD, Mastopexia e Facelift com ciclo de decisão de 45 a 90 dias.")}
                  >
                    🏥 Cirurgia Plástica
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "niche" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-arkos-gold uppercase tracking-wide block">
                    Descrição Detalhada do Nicho
                  </label>
                  <textarea
                    value={query.nicheDescription}
                    onChange={(e) => setQuery(p => ({ ...p, nicheDescription: e.target.value }))}
                    placeholder="Ex: Clínicas de Cirurgia Plástica focadas em Lipo HD e implantes mamários..."
                    className="w-full h-32 p-4 rounded-2xl bg-arkos-bg border border-arkos-border text-sm text-text-primary focus:outline-none focus:border-arkos-gold transition-all resize-none"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-arkos-gold uppercase tracking-wide block">
                    Perfil do Cliente Ideal (ICP) & Faturamento
                  </label>
                  <textarea
                    value={query.icpDetails}
                    onChange={(e) => setQuery(p => ({ ...p, icpDetails: e.target.value }))}
                    placeholder="Ex: Faturamento mensal entre 200k e 1M, equipe de 10-20 pessoas, usa software X..."
                    className="w-full h-32 p-4 rounded-2xl bg-arkos-bg border border-arkos-border text-sm text-text-primary focus:outline-none focus:border-arkos-gold transition-all resize-none"
                  />
                </div>
              </div>
              <div className="p-4 bg-arkos-gold/5 border border-arkos-gold/20 rounded-2xl">
                <p className="text-xs text-arkos-gold-light">
                  💡 <strong>Dica do Agente:</strong> Quanto mais específico você for no faturamento e na especialidade, mais precisos serão os leads encontrados pela IA.
                </p>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
              {history.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-arkos-border rounded-3xl">
                  <RefreshCw className="h-10 w-10 text-text-muted mx-auto mb-3 opacity-20" />
                  <p className="text-sm text-text-secondary">Nenhuma busca salva ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide block mb-2">
                    Últimas 10 Buscas Realizadas
                  </label>
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setQuery(item.query);
                        setResults(item.results);
                        setHasSearched(true);
                        setActiveTab("basic");
                        toast.success("Busca restaurada do histórico!");
                      }}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-arkos-bg-secondary hover:bg-arkos-bg-tertiary border border-arkos-border transition-all text-left group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-primary">
                            {item.query.industries.join(", ")}
                          </span>
                          <span className="text-2xs text-text-muted">•</span>
                          <span className="text-2xs text-arkos-gold font-medium">
                            {item.results.length} leads
                          </span>
                        </div>
                        <p className="text-2xs text-text-muted truncate max-w-md">
                          {item.query.locations.join(", ")} | {item.query.nicheDescription || "Busca Geral"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xs text-text-muted mb-1">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </p>
                        <span className="text-2xs text-arkos-blue-light font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          Restaurar →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Botão buscar (oculto na aba histórico) */}
          {activeTab !== "history" && (
            <div className="pt-4 border-t border-arkos-border">
              <Button
                variant="gold"
                size="lg"
                fullWidth
                loading={isSearching}
                onClick={handleSearch}
                icon={<Search className="h-4 w-4" />}
                className="h-14 rounded-2xl shadow-xl shadow-arkos-gold/10"
              >
                {isSearching
                  ? `IA Prospectando ${query.locations.join(" e ")}...`
                  : `Prospectar ${query.limit} Empresas Agora`}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* ─── RESULTADOS ─── */}
      {hasSearched && (
        <div className="space-y-4">

          {/* Header resultados */}
          {!isSearching && results.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-text-primary">
                  {results.length} empresas encontradas
                </h3>
                {highPriority > 0 && (
                  <Badge variant="success" dot>
                    🔥 {highPriority} alta prioridade
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="xs"
                  icon={<Download className="h-3.5 w-3.5" />}
                >
                  Exportar
                </Button>
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={handleSearch}
                  icon={<RefreshCw className="h-3.5 w-3.5" />}
                >
                  Nova busca
                </Button>
              </div>
            </div>
          )}

          {/* Loading */}
          {isSearching && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-arkos-blue/10 border border-arkos-blue/20 flex items-center justify-center">
                  <Bot className="h-8 w-8 text-arkos-blue-light" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-arkos-gold/20 border border-arkos-gold flex items-center justify-center">
                  <Loader2 className="h-3 w-3 text-arkos-gold animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-text-primary">
                  Prospectando com IA...
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Buscando {query.limit} empresas nos setores selecionados
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-arkos-blue-light animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Cards dos resultados */}
          {!isSearching && results.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {results
                .sort((a, b) => (b.fitScore?.total || 0) - (a.fitScore?.total || 0))
                .map((prospect) => (
                  <ProspectCard
                    key={prospect.id}
                    prospect={prospect}
                    onConvert={handleLocalConvert}
                  />
                ))}
            </div>
          )}

          {!isSearching && results.length === 0 && hasSearched && (
            <div className="text-center py-12">
              <Search className="h-10 w-10 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-secondary">Nenhuma empresa encontrada</p>
              <p className="text-xs text-text-muted mt-1">
                Tente ajustar os filtros da busca
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
