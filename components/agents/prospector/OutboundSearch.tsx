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
  "Saúde", "Logística", "Educação", "Financeiro",
  "Varejo", "Indústria", "Tecnologia", "Agronegócio",
  "Construção Civil", "Serviços", "Alimentação",
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
  const [query, setQuery] = useState<OutboundSearchQuery>({
    industries: ["Saúde", "Logística"],
    sizes: ["small", "medium"],
    roles: ["CEO", "Diretor Financeiro", "COO"],
    location: "São Paulo",
    painPoints: ["processos manuais", "falta de integração"],
    keywords: [],
    limit: 8,
  });

  const [results, setResults] = useState<Prospect[]>([]);
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
      const res = await fetch("/api/agents/prospector/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setResults(data.prospects || []);
      toast.success(
        `${data.prospects?.length || 0} empresas encontradas com IA!`,
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

  const highPriority = results.filter(
    (p) => p.fitScore?.recommendation === "high_priority"
  ).length;

  return (
    <div className="space-y-5">

      {/* ─── CONFIGURAÇÃO DA BUSCA ─── */}
      <Card>
        <div className="space-y-5">

          {/* Setores */}
          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2.5 block">
              Setores Alvo *
            </label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((ind) => {
                const selected = query.industries.includes(ind);
                return (
                  <button
                    key={ind}
                    onClick={() =>
                      toggleItem(query.industries, ind, (v) =>
                        setQuery((p) => ({ ...p, industries: v }))
                      )
                    }
                    className={cn(
                      "px-3 py-1.5 rounded-xl border text-xs font-medium transition-all",
                      selected
                        ? "bg-arkos-blue/10 border-arkos-blue/40 text-arkos-blue-light"
                        : "border-arkos-border text-text-muted hover:border-arkos-blue/30 hover:text-text-secondary"
                    )}
                  >
                    {selected && "✓ "}{ind}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tamanhos */}
          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2.5 block">
              Porte da Empresa *
            </label>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => {
                const selected = query.sizes.includes(size.id);
                return (
                  <button
                    key={size.id}
                    onClick={() =>
                      toggleItem(query.sizes, size.id, (v) =>
                        setQuery((p) => ({ ...p, sizes: v }))
                      )
                    }
                    className={cn(
                      "flex flex-col items-center px-4 py-2 rounded-xl border transition-all",
                      selected
                        ? "bg-arkos-gold/10 border-arkos-gold/40 text-arkos-gold"
                        : "border-arkos-border text-text-muted hover:border-arkos-gold/20"
                    )}
                  >
                    <span className="text-xs font-semibold">{size.label}</span>
                    <span className="text-2xs opacity-60">{size.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cargos e Localização */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2.5 block">
                Cargos Alvo *
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ROLES.map((role) => {
                  const selected = query.roles.includes(role);
                  return (
                    <button
                      key={role}
                      onClick={() =>
                        toggleItem(query.roles, role, (v) =>
                          setQuery((p) => ({ ...p, roles: v }))
                        )
                      }
                      className={cn(
                        "px-2.5 py-1 rounded-lg border text-2xs font-medium transition-all",
                        selected
                          ? "bg-success/10 border-success/30 text-success"
                          : "border-arkos-border text-text-muted hover:border-success/20"
                      )}
                    >
                      {selected && "✓ "}{role}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2.5 block">
                  Localização
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setQuery((p) => ({ ...p, location: loc }))}
                      className={cn(
                        "px-2.5 py-1 rounded-lg border text-2xs font-medium transition-all",
                        query.location === loc
                          ? "bg-arkos-blue/10 border-arkos-blue/40 text-arkos-blue-light"
                          : "border-arkos-border text-text-muted hover:border-arkos-blue/20"
                      )}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Qtd de resultados */}
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">
                  Quantidade: {query.limit} empresas
                </label>
                <input
                  type="range"
                  min={4}
                  max={20}
                  step={2}
                  value={query.limit}
                  onChange={(e) =>
                    setQuery((p) => ({ ...p, limit: Number(e.target.value) }))
                  }
                  className="w-full accent-arkos-blue"
                />
                <div className="flex justify-between text-2xs text-text-muted mt-1">
                  <span>4</span>
                  <span>20</span>
                </div>
              </div>
            </div>
          </div>

          {/* Avançado */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              <Sliders className="h-3.5 w-3.5" />
              Filtros avançados
              {showAdvanced ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            {showAdvanced && (
              <div className="mt-3 pt-3 border-t border-arkos-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dores */}
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">
                    Dores / Keywords de Problema
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(query.painPoints || []).map((pain) => (
                      <span
                        key={pain}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger/10 border border-danger/20 text-2xs text-danger"
                      >
                        {pain}
                        <button
                          onClick={() =>
                            setQuery((p) => ({
                              ...p,
                              painPoints: p.painPoints?.filter((x) => x !== pain),
                            }))
                          }
                          className="hover:text-danger/70"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newPain}
                      onChange={(e) => setNewPain(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newPain.trim()) {
                          setQuery((p) => ({
                            ...p,
                            painPoints: [...(p.painPoints || []), newPain.trim()],
                          }));
                          setNewPain("");
                        }
                      }}
                      placeholder="planilhas manuais... Enter"
                      className="flex-1 h-8 px-3 rounded-lg text-xs bg-arkos-bg border border-arkos-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arkos-blue transition-all"
                    />
                  </div>
                </div>

                {/* Keywords adicionais */}
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">
                    Keywords Adicionais
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(query.keywords || []).map((kw) => (
                      <span
                        key={kw}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-info/10 border border-info/20 text-2xs text-info"
                      >
                        {kw}
                        <button
                          onClick={() =>
                            setQuery((p) => ({
                              ...p,
                              keywords: p.keywords?.filter((x) => x !== kw),
                            }))
                          }
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newKeyword.trim()) {
                        setQuery((p) => ({
                          ...p,
                          keywords: [...(p.keywords || []), newKeyword.trim()],
                        }));
                        setNewKeyword("");
                      }
                    }}
                    placeholder="crescimento, contratando... Enter"
                    className="w-full h-8 px-3 rounded-lg text-xs bg-arkos-bg border border-arkos-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arkos-blue transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botão buscar */}
          <Button
            variant="gold"
            size="lg"
            fullWidth
            loading={isSearching}
            onClick={handleSearch}
            icon={<Search className="h-4 w-4" />}
          >
            {isSearching
              ? `Prospectando com IA... (${query.limit} empresas)`
              : `Buscar ${query.limit} Empresas com IA`}
          </Button>
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
                    onConvert={onConvert}
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
