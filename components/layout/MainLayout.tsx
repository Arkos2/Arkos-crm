"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

// Mapa de breadcrumbs por rota
const breadcrumbMap: Record<string, { label: string; parent?: string }> = {
  "/dashboard": { label: "Dashboard" },
  "/agents": { label: "Agentes IA" },
  "/agents/prospector": { label: "Prospector", parent: "/agents" },
  "/agents/qualifier": { label: "Qualificador", parent: "/agents" },
  "/agents/writer": { label: "Redator", parent: "/agents" },
  "/agents/followup": { label: "Follow-Up", parent: "/agents" },
  "/agents/analyst": { label: "Analista", parent: "/agents" },
  "/agents/coach": { label: "Coach", parent: "/agents" },
  "/pipeline": { label: "Pipeline" },
  "/contacts": { label: "Contatos" },
  "/contacts/people": { label: "Pessoas", parent: "/contacts" },
  "/contacts/organizations": { label: "Organizações", parent: "/contacts" },
  "/inbox": { label: "Caixa de Entrada" },
  "/communication": { label: "Comunicação" },
  "/activities": { label: "Atividades" },
  "/documents": { label: "Documentos" },
  "/goals": { label: "Metas" },
  "/insights": { label: "Insights" },
  "/portal": { label: "Portal do Cliente" },
  "/settings": { label: "Configurações" },
};

function getBreadcrumbs(pathname: string) {
  const current = breadcrumbMap[pathname];
  if (!current) return [{ label: "Dashboard", href: "/dashboard" }];

  const crumbs = [];

  if (current.parent) {
    const parent = breadcrumbMap[current.parent];
    if (parent) {
      crumbs.push({ label: parent.label, href: current.parent });
    }
  }

  crumbs.push({ label: current.label });
  return crumbs;
}

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Ler preferência salva
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) setCollapsed(saved === "true");
  }, []);

  const handleToggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  if (!mounted) return null;

  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <div className="min-h-screen bg-arkos-bg">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={handleToggle} />

      {/* Conteúdo principal */}
      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300",
          collapsed ? "pl-16" : "pl-64"
        )}
      >
        {/* Header */}
        <Header breadcrumbs={breadcrumbs} collapsed={collapsed} />

        {/* Área de conteúdo */}
        <main className="flex-1 pt-14">
          <div className="p-5 sm:p-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay clique fora das notificações */}
      <div id="overlay-root" />
    </div>
  );
}
