"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  User, Settings, LogOut, ChevronDown,
  Bell, Shield, HelpCircle,
} from "lucide-react";
import Link from "next/link";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all",
          isOpen ? "bg-arkos-surface-2" : "hover:bg-arkos-surface-2"
        )}
      >
        <Avatar name={user.fullName} size="sm" status="online" />
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-text-primary leading-none">
            {user.firstName}
          </p>
          <p className="text-2xs text-text-muted leading-none mt-0.5 capitalize">
            {user.role}
          </p>
        </div>
        <ChevronDown className={cn(
          "h-3.5 w-3.5 text-text-muted transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-arkos-surface-3 border border-arkos-border rounded-2xl shadow-arkos-lg z-40 overflow-hidden animate-scale-in">

            {/* User info */}
            <div className="px-4 py-3 border-b border-arkos-border">
              <p className="text-sm font-bold text-text-primary">{user.fullName}</p>
              <p className="text-xs text-text-muted">{user.email}</p>
              {user.companyName && (
                <p className="text-2xs text-text-muted mt-0.5">{user.companyName}</p>
              )}
            </div>

            {/* Menu items */}
            <div className="py-1">
              {[
                { icon: User, label: "Meu Perfil", href: "/settings/profile" },
                { icon: Settings, label: "Configurações", href: "/settings" },
                { icon: Bell, label: "Notificações", href: "/settings/notifications" },
                { icon: HelpCircle, label: "Suporte", href: "/help" },
              ].map(({ icon: Icon, label, href }) => (
                <Link key={label} href={href} onClick={() => setIsOpen(false)}>
                  <div className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-arkos-surface-2 transition-colors">
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </div>
                </Link>
              ))}
            </div>

            {/* Logout */}
            <div className="border-t border-arkos-border py-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut();
                }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-medium text-danger hover:bg-danger/10 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sair do sistema
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
