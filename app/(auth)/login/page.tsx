"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import {
  Mail, Lock, Eye, EyeOff, Loader2,
  Zap, AlertCircle, ArrowRight, CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const errorParam = searchParams.get("error");

  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === "auth_callback_failed"
      ? "Erro na autenticação. Tente novamente."
      : null
  );
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError("Preencha todos os campos");
      return;
    }

    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-arkos-bg flex">

      {/* ─── LADO ESQUERDO: BRANDING ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-arkos-surface via-arkos-surface-2 to-arkos-bg flex-col justify-between p-12">

        {/* Decoração */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-arkos-blue/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-arkos-gold/10 blur-3xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-blue flex items-center justify-center shadow-arkos-glow-blue">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-black text-text-primary tracking-wide">ARKOS</p>
            <p className="text-2xs text-text-muted tracking-widest uppercase">CRM Enterprise</p>
          </div>
        </div>

        {/* Headline */}
        <div className="relative space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-black text-text-primary leading-tight">
              Venda mais com
              <span className="block text-gradient-gold">Inteligência Artificial</span>
            </h1>
            <p className="text-base text-text-secondary leading-relaxed max-w-sm">
              6 Agentes de IA trabalhando para você 24/7.
              Pipeline inteligente, qualificação automática e insights acionáveis.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {[
              { emoji: "🤖", text: "6 Agentes de IA especializados" },
              { emoji: "📊", text: "Pipeline com BANT Score automático" },
              { emoji: "⚡", text: "Automações inteligentes sem código" },
              { emoji: "🎯", text: "Qualificação de leads em tempo real" },
            ].map(({ emoji, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-arkos-surface border border-arkos-border flex items-center justify-center text-base shrink-0">
                  {emoji}
                </div>
                <span className="text-sm text-text-secondary">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative p-5 rounded-2xl border border-arkos-gold/20 bg-arkos-gold/5">
          <p className="text-sm text-text-secondary italic leading-relaxed mb-3">
            "O ARKOS CRM transformou nosso processo comercial. Fechamos 40% mais deals
            no primeiro mês usando os agentes de IA."
          </p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-blue flex items-center justify-center text-xs font-bold text-white">
              DR
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary">Dr. Rafael Lima</p>
              <p className="text-2xs text-text-muted">CEO, SaúdeTec Hospital</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── LADO DIREITO: FORMULÁRIO ─── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">

          {/* Header mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-blue flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-base font-black text-text-primary">ARKOS CRM</p>
            </div>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-text-primary">
              Bem-vindo de volta 👋
            </h2>
            <p className="text-sm text-text-secondary">
              Entre na sua conta para acessar o CRM
            </p>
          </div>

          {/* Erro */}
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-danger/10 border border-danger/30">
              <AlertCircle className="h-4 w-4 text-danger shrink-0" />
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* E-mail */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">
                E-mail corporativo
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="voce@empresa.com.br"
                  required
                  autoComplete="email"
                  className={cn(
                    "w-full h-11 pl-10 pr-4 rounded-xl text-sm",
                    "bg-arkos-surface border border-arkos-border",
                    "text-text-primary placeholder:text-text-muted",
                    "focus:outline-none focus:border-arkos-blue focus:ring-2 focus:ring-arkos-blue/20",
                    "transition-all duration-200"
                  )}
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-text-secondary">
                  Senha
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-arkos-blue-light hover:text-arkos-gold transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Lembrar */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData(p => ({ ...p, rememberMe: e.target.checked }))}
                  className="sr-only"
                />
                <div className={cn(
                  "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                  formData.rememberMe
                    ? "bg-arkos-blue border-arkos-blue"
                    : "border-arkos-border bg-arkos-surface"
                )}>
                  {formData.rememberMe && <CheckCircle2 className="h-3 w-3 text-white" />}
                </div>
              </div>
              <span className="text-xs text-text-secondary">Manter conectado por 30 dias</span>
            </label>

            {/* Botão */}
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "w-full h-11 rounded-xl font-semibold text-sm",
                "flex items-center justify-center gap-2",
                "bg-gradient-gold text-arkos-bg",
                "hover:shadow-arkos-glow-gold hover:scale-[1.02]",
                "active:scale-[0.98]",
                "transition-all duration-200",
                "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar no ARKOS CRM
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-arkos-border" />
            <span className="text-xs text-text-muted">ou</span>
            <div className="flex-1 h-px bg-arkos-border" />
          </div>

          {/* Demo account */}
          <div className="p-4 rounded-2xl border border-arkos-blue/20 bg-arkos-blue/5 space-y-3">
            <p className="text-xs font-semibold text-arkos-blue-light text-center">
              🎯 Conta de Demonstração
            </p>
            <div className="grid grid-cols-2 gap-2 text-2xs text-text-secondary">
              <div className="flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-text-muted" />
                demo@arkos.com.br
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-text-muted" />
                arkos@2025
              </div>
            </div>
            <button
              onClick={() => {
                setFormData({ email: "demo@arkos.com.br", password: "arkos@2025", rememberMe: false });
              }}
              className="w-full py-2 rounded-xl border border-arkos-blue/30 text-xs font-medium text-arkos-blue-light hover:bg-arkos-blue/10 transition-all"
            >
              Preencher automaticamente
            </button>
          </div>

          {/* Link registro */}
          <p className="text-center text-xs text-text-muted">
            Não tem uma conta?{" "}
            <Link
              href="/register"
              className="text-arkos-blue-light hover:text-arkos-gold font-semibold transition-colors"
            >
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
