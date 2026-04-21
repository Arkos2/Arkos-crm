"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Bell, Search, Plus, ChevronRight } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { UserMenu } from "./UserMenu";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  collapsed?: boolean;
}

// Mock de notificações
const mockNotifications = [
  {
    id: 1,
    title: "Proposta visualizada",
    description: "TechCorp abriu sua proposta 2x",
    time: "há 2min",
    type: "hot",
    unread: true,
  },
  {
    id: 2,
    title: "Lead qualificado",
    description: "Agente IA qualificou EduPlus (BANT: 82)",
    time: "há 15min",
    type: "success",
    unread: true,
  },
  {
    id: 3,
    title: "Follow-up atrasado",
    description: "3 leads sem contato há 48h",
    time: "há 1h",
    type: "warning",
    unread: false,
  },
];

export function Header({
  breadcrumbs = [],
  actions,
  collapsed = false,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = mockNotifications.filter((n) => n.unread).length;

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-14",
        "flex items-center justify-between px-4 gap-4",
        "bg-arkos-bg/80 backdrop-blur-xl",
        "border-b border-arkos-border",
        "transition-all duration-300",
        collapsed ? "left-16" : "left-64"
      )}
    >
      {/* ─── BREADCRUMB ─── */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-text-muted text-xs font-medium">ARKOS</span>
        {breadcrumbs.map((crumb, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 text-text-muted shrink-0" />
            <span
              className={cn(
                "text-xs font-medium truncate",
                i === breadcrumbs.length - 1
                  ? "text-text-primary"
                  : "text-text-secondary hover:text-text-primary cursor-pointer"
              )}
            >
              {crumb.label}
            </span>
          </div>
        ))}
      </div>

      {/* ─── AÇÕES ─── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Busca global */}
        <button
          className={cn(
            "flex items-center gap-2 px-3 h-8 rounded-lg",
            "bg-arkos-surface border border-arkos-border",
            "text-text-muted hover:text-text-primary",
            "hover:border-arkos-border-2",
            "transition-all duration-200",
            "text-xs"
          )}
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">Buscar...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-2xs font-mono bg-arkos-surface-3 border border-arkos-border-2 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Notificações */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              "relative p-2 rounded-lg transition-all duration-200",
              "text-text-secondary hover:text-text-primary",
              "hover:bg-arkos-surface-2",
              showNotifications && "bg-arkos-surface-2 text-text-primary"
            )}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger animate-pulse" />
            )}
          </button>

          {/* Dropdown de notificações */}
          {showNotifications && (
            <div
              className={cn(
                "absolute right-0 top-full mt-2 w-80",
                "bg-arkos-surface border border-arkos-border rounded-xl",
                "shadow-arkos-lg animate-scale-in",
                "z-50 overflow-hidden"
              )}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-arkos-border">
                <span className="text-sm font-semibold text-text-primary">
                  Notificações
                </span>
                <Badge variant="blue" dot dotAnimate>
                  {unreadCount} novas
                </Badge>
              </div>

              <div className="divide-y divide-arkos-border max-h-72 overflow-y-auto">
                {mockNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      "flex gap-3 px-4 py-3 cursor-pointer",
                      "hover:bg-arkos-surface-2 transition-colors",
                      notif.unread && "bg-arkos-blue/5"
                    )}
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full mt-1.5 shrink-0",
                        notif.type === "hot" && "bg-danger",
                        notif.type === "success" && "bg-success",
                        notif.type === "warning" && "bg-warning",
                        !notif.unread && "opacity-0"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text-primary">
                        {notif.title}
                      </p>
                      <p className="text-2xs text-text-secondary mt-0.5 truncate">
                        {notif.description}
                      </p>
                      <p className="text-2xs text-text-muted mt-1">
                        {notif.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 py-2 border-t border-arkos-border">
                <button className="text-2xs text-arkos-blue-light hover:text-arkos-gold transition-colors w-full text-center">
                  Ver todas as notificações
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions customizados */}
        {actions}

        {/* CTA principal */}
        <Button
          variant="gold"
          size="sm"
          icon={<Plus className="h-3.5 w-3.5" />}
        >
          Novo Negócio
        </Button>

        {/* Menu do usuário */}
        <div className="border-l border-arkos-border pl-2 ml-1">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
