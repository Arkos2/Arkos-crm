"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { register } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import {
  Mail, Lock, Eye, EyeOff, User,
  Building2, Phone, Loader2, Zap,
  AlertCircle, CheckCircle2, ArrowRight,
} from "lucide-react";

// Requisitos de senha
const PASSWORD_RULES = [
  { label: "Mínimo 8 caracteres", test: (p: string) => p.length >= 8 },
  { label: "Letra maiúscula", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Número", test: (p: string) => /\d/.test(p) },
];

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    phone: "",
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(p => ({ ...p, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    startTransition(async () => {
      const result = await register(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.message || "Conta criada com sucesso!");
      }
    });
  };

  return (
    <div className="min-h-screen bg-arkos-bg flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-blue flex items-center justify-center shadow-arkos-glow-blue">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-primary">
              Criar conta no ARKOS CRM
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Comece gratuitamente. Sem cartão de crédito.
            </p>
          </div>
        </div>

        {/* Feedback */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-danger/10 border border-danger/30">
            <AlertCircle className="h-4 w-4 text-danger shrink-0" />
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-success/10 border border-success/30">
            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
            <div>
              <p className="text-sm font-semibold text-success">Conta criada!</p>
              <p className="text-xs text-success/80 mt-0.5">{success}</p>
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nome completo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">
                Nome completo *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Maria Santos"
                  required
                  autoComplete="name"
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

            {/* Email + Empresa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">
                  E-mail *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="maria@empresa.com"
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

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">
                  Empresa
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                    placeholder="ARKOS Tecnologia"
                    autoComplete="organization"
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
            </div>

            {/* Telefone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="(11) 99999-9999"
                  autoComplete="tel"
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

            {/* Senha + Confirmar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">
                  Senha *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">
                  Confirmar senha *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    className={cn(
                      "w-full h-11 pl-10 pr-4 rounded-xl text-sm",
                      "bg-arkos-surface border border-arkos-border",
                      "text-text-primary placeholder:text-text-muted",
                      "focus:outline-none focus:border-arkos-blue focus:ring-2 focus:ring-arkos-blue/20",
                      "transition-all duration-200",
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? "border-danger/60"
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? "border-success/60"
                        : ""
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Requisitos de senha */}
            {formData.password && (
              <div className="grid grid-cols-3 gap-2">
                {PASSWORD_RULES.map(({ label, test }) => {
                  const ok = test(formData.password);
                  return (
                    <div key={label} className={cn(
                      "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-2xs border",
                      ok
                        ? "bg-success/10 border-success/20 text-success"
                        : "bg-arkos-surface-2 border-arkos-border text-text-muted"
                    )}>
                      <CheckCircle2 className={cn("h-3 w-3 shrink-0", !ok && "opacity-30")} />
                      {label}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Termos */}
            <p className="text-xs text-text-muted text-center">
              Ao criar uma conta, você concorda com os{" "}
              <Link href="/terms" className="text-arkos-blue-light hover:underline">
                Termos de Uso
              </Link>{" "}
              e{" "}
              <Link href="/privacy" className="text-arkos-blue-light hover:underline">
                Política de Privacidade
              </Link>
            </p>

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
                  Criando conta...
                </>
              ) : (
                <>
                  Criar minha conta
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Link login */}
        <p className="text-center text-xs text-text-muted">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="text-arkos-blue-light hover:text-arkos-gold font-semibold transition-colors"
          >
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
