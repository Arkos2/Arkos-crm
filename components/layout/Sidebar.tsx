"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Bot,
  Kanban,
  Users,
  Inbox,
  MessageSquare,
  CheckSquare,
  FileText,
  Target,
  BarChart3,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
} from "lucide-react";
import Image from "next/image";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeVariant?: "blue" | "gold" | "danger" | "success";
  isNew?: boolean;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Agentes IA",
    href: "/agents",
    icon: Bot,
    badge: "6",
    badgeVariant: "gold",
    isNew: true,
  },
  {
    label: "Pipeline",
    href: "/pipeline",
    icon: Kanban,
    badge: 23,
  },
  {
    label: "Contatos",
    href: "/contacts",
    icon: Users,
  },
  {
    label: "Caixa de Entrada",
    href: "/inbox",
    icon: Inbox,
    badge: 8,
    badgeVariant: "blue",
  },
  {
    label: "Comunicação",
    href: "/communication",
    icon: MessageSquare,
    badge: 12,
    badgeVariant: "danger",
  },
  {
    label: "Atividades",
    href: "/activities",
    icon: CheckSquare,
    badge: 5,
  },
  {
    label: "Documentos",
    href: "/documents",
    icon: FileText,
  },
  {
    label: "Metas",
    href: "/goals",
    icon: Target,
  },
  {
    label: "Insights",
    href: "/insights",
    icon: BarChart3,
  },
  {
    label: "Portal Cliente",
    href: "/portal",
    icon: Building2,
  },
  {
    label: "Configurações",
    href: "/settings",
    icon: Settings,
  },
];

// Grupos de navegação
const topNavItems = navItems.slice(0, 8);
const bottomNavItems = navItems.slice(8);

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen",
        "flex flex-col",
        "bg-gradient-sidebar border-r border-arkos-border",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* ─── LOGO ─── */}
      <div
        className={cn(
          "flex items-center h-14 border-b border-arkos-border shrink-0",
          collapsed ? "justify-center px-3" : "px-5 gap-3"
        )}
      >
        {/* Ícone logo */}
        <div
          className={cn(
            "relative shrink-0 transition-all duration-300",
            collapsed ? "w-8 h-8" : "w-10 h-10"
          )}
        >
          <Image 
            src="/logo.png"
            alt="ARKOS Logo"
            fill
            className="object-contain"
          />
        </div>

        {/* Nome */}
        {!collapsed && (
          <div className="flex flex-col leading-none animate-fade-in">
            <span className="text-sm font-bold text-text-primary tracking-wide">
              ARKOS
            </span>
            <span className="text-2xs text-text-muted tracking-widest uppercase">
              CRM
            </span>
          </div>
        )}

        {/* Toggle */}
        <button
          onClick={onToggle}
          className={cn(
            "ml-auto p-1 rounded-lg transition-all duration-200",
            "text-text-muted hover:text-text-primary hover:bg-arkos-surface-2",
            collapsed && "ml-0 mt-0"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* ─── NAV PRINCIPAL ─── */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        <div className="space-y-0.5 px-2">
          {topNavItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname === item.href || pathname.startsWith(item.href + "/")}
              collapsed={collapsed}
            />
          ))}
        </div>

        {/* Divisor */}
        <div className="my-3 mx-4 border-t border-arkos-border opacity-50" />

        <div className="space-y-0.5 px-2">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname === item.href}
              collapsed={collapsed}
            />
          ))}
        </div>
      </nav>

      {/* ─── FOOTER / USER ─── */}
      <div className="shrink-0 border-t border-arkos-border p-2">
        <div
          className={cn(
            "flex items-center rounded-xl p-2 gap-3",
            "hover:bg-arkos-surface-2 cursor-pointer transition-all duration-200",
            collapsed && "justify-center"
          )}
        >
          <Avatar
            name={user?.name || "Administrador"}
            size="sm"
            status="online"
          />

          {!collapsed && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="text-xs font-semibold text-text-primary truncate">
                {user?.name || "Administrador"}
              </p>
              <p className="text-2xs text-text-muted truncate">
                {user?.role || "Cargo Indefinido"}
              </p>
            </div>
          )}

          {!collapsed && (
            <div className="flex items-center gap-1 shrink-0">
              <button className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-arkos-surface-3 transition-colors">
                <Bell className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={signOut}
                className="p-1 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─── NAV LINK ───
interface NavLinkProps {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}

function NavLink({ item, active, collapsed }: NavLinkProps) {
  const Icon = item.icon;

  return (
    <Link href={item.href}>
      <div
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5",
          "transition-all duration-200 cursor-pointer",
          "text-text-secondary",
          // Active
          active
            ? [
                "bg-arkos-blue/10 text-arkos-blue-light",
                "border border-arkos-blue/20",
              ].join(" ")
            : "hover:bg-arkos-surface-2 hover:text-text-primary border border-transparent",
          collapsed && "justify-center px-2"
        )}
      >
        {/* Borda ativa esquerda */}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-arkos-gold rounded-full" />
        )}

        {/* Ícone */}
        <Icon
          className={cn(
            "shrink-0 transition-colors duration-200",
            active ? "h-4 w-4 text-arkos-blue-light" : "h-4 w-4",
            "group-hover:scale-110 transition-transform duration-200"
          )}
        />

        {/* Label */}
        {!collapsed && (
          <span className="flex-1 text-xs font-medium truncate animate-fade-in">
            {item.label}
          </span>
        )}

        {/* Badge */}
        {!collapsed && item.badge !== undefined && (
          <span
            className={cn(
              "shrink-0 text-2xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center",
              item.badgeVariant === "gold"
                ? "bg-arkos-gold/10 text-arkos-gold"
                : item.badgeVariant === "danger"
                ? "bg-danger/10 text-danger"
                : item.badgeVariant === "success"
                ? "bg-success/10 text-success"
                : "bg-arkos-blue/10 text-arkos-blue-light"
            )}
          >
            {item.badge}
          </span>
        )}

        {/* NEW badge */}
        {!collapsed && item.isNew && !item.badge && (
          <span className="shrink-0 text-2xs font-bold rounded-full px-1.5 py-0.5 bg-arkos-gold/10 text-arkos-gold border border-arkos-gold/20">
            NEW
          </span>
        )}

        {/* Tooltip quando collapsed */}
        {collapsed && (
          <div
            className={cn(
              "absolute left-full ml-3 px-2.5 py-1.5 rounded-lg",
              "bg-arkos-surface-3 border border-arkos-border-2",
              "text-xs font-medium text-text-primary whitespace-nowrap",
              "opacity-0 group-hover:opacity-100 pointer-events-none",
              "transition-all duration-200 shadow-arkos",
              "translate-x-1 group-hover:translate-x-0",
              "z-50"
            )}
          >
            {item.label}
            {item.badge !== undefined && (
              <span className="ml-1.5 text-arkos-blue-light">({item.badge})</span>
            )}
            {/* Arrow */}
            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-arkos-border-2" />
          </div>
        )}
      </div>
    </Link>
  );
}
