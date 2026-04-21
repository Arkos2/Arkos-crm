import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number,
  currency = "BRL",
  locale = "pt-BR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, locale = "pt-BR"): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(date: Date | string, locale = "pt-BR"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.NumberFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  } as any).format(d as any); // Using any temporarily to bypass initial ts error if it occurs with Intl.DateTimeFormat
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "agora";
  if (diffMins < 60) return `há ${diffMins}min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays < 7) return `há ${diffDays}d`;
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getBantColor(score: number): string {
  if (score >= 75) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-danger";
}

export function getBantBg(score: number): string {
  if (score >= 75) return "bg-success";
  if (score >= 50) return "bg-warning";
  return "bg-danger";
}

export function getDealStatusColor(status: string): string {
  const map: Record<string, string> = {
    hot: "text-danger",
    warm: "text-warning",
    cold: "text-info",
    rotting: "text-danger",
    active: "text-success",
  };
  return map[status] || "text-text-secondary";
}

// ==========================================
// FUNÇÕES LEGADAS (MANTIDAS PARA COMPATIBILIDADE)
// ==========================================

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

export function corScore(score: number): string {
  if (score >= 80) return 'text-success bg-success/10 border-success/20';
  if (score >= 50) return 'text-warning bg-warning/10 border-warning/20';
  return 'text-danger bg-danger/10 border-danger/20';
}

export function corStatus(status: string): string {
  const map: Record<string, string> = {
    'novo': 'bg-info',
    'qualificacao': 'bg-arkos-blue-light',
    'proposta': 'bg-warning',
    'negociacao': 'bg-orange-500',
    'fechado_ganho': 'bg-success',
    'fechado_perdido': 'bg-danger',
    'triagem_ia': 'bg-info',
    'diagnostico': 'bg-warning',
  };
  return map[status] || 'bg-arkos-surface-3';
}

export function labelStatus(status: string): string {
  const map: Record<string, string> = {
    'novo': 'Novo',
    'qualificacao': 'Qualificação',
    'proposta': 'Proposta',
    'negociacao': 'Negociação',
    'fechado_ganho': 'Ganho',
    'fechado_perdido': 'Perdido',
    'triagem_ia': 'Triagem IA',
    'diagnostico': 'Diagnóstico',
  };
  return map[status] || status;
}

export function corTemperatura(temp: string): string {
  if (temp === 'Quente') return 'text-danger bg-danger/10';
  if (temp === 'Morno') return 'text-warning bg-warning/10';
  return 'text-info bg-info/10';
}

export function labelTemperatura(temp: string): string {
  return temp;
}

export function labelCanal(canal: string): string {
  if (!canal) return 'Indefinido';
  return canal;
}

export function formatarData(data: string | Date | undefined): string {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR');
}

export function diasAtras(data: string | Date | undefined): number {
  if (!data) return 0;
  const diffTime = Math.abs(new Date().getTime() - new Date(data).getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function corPrioridade(prioridade: string): string {
  if (prioridade === 'alta') return 'text-danger';
  if (prioridade === 'media') return 'text-warning';
  return 'text-info';
}

export function labelPrioridade(prioridade: string): string {
  return prioridade || 'Normal';
}
