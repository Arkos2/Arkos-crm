"use client";

import { useState, useTransition } from "react";
import { updatePassword } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import { Lock, Eye, EyeOff, Loader2, Zap } from "lucide-react";

export default function ResetPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    startTransition(async () => {
      const result = await updatePassword(formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="min-h-screen bg-arkos-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-blue flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-primary">Nova senha</h1>
            <p className="text-sm text-text-secondary mt-1">Escolha uma senha forte</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-danger/10 border border-danger/30">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Nova senha</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className={cn(
                  "w-full h-11 pl-10 pr-11 rounded-xl text-sm",
                  "bg-arkos-surface border border-arkos-border",
                  "text-text-primary placeholder:text-text-muted",
                  "focus:outline-none focus:border-arkos-blue focus:ring-2 focus:ring-arkos-blue/20",
                  "transition-all duration-200"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Confirmar nova senha</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className={cn(
                  "w-full h-11 pl-10 pr-11 rounded-xl text-sm",
                  "bg-arkos-surface border border-arkos-border",
                  "text-text-primary placeholder:text-text-muted",
                  "focus:outline-none focus:border-arkos-blue focus:ring-2 focus:ring-arkos-blue/20",
                  "transition-all duration-200"
                )}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={cn(
              "w-full h-11 rounded-xl font-semibold text-sm",
              "flex items-center justify-center gap-2",
              "bg-gradient-gold text-arkos-bg",
              "hover:shadow-arkos-glow-gold hover:scale-[1.02]",
              "transition-all duration-200",
              "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            )}
          >
            {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</> : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
