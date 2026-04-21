"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import { Mail, Loader2, Zap, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Digite seu e-mail");
      return;
    }

    startTransition(async () => {
      const result = await resetPassword({ email });
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  };

  return (
    <div className="min-h-screen bg-arkos-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-blue flex items-center justify-center shadow-arkos-glow-blue">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-primary">
              Recuperar senha
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {success
                ? "Verifique seu e-mail"
                : "Enviaremos um link para redefinir sua senha"}
            </p>
          </div>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-success/30 bg-success/5 text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <div>
                <p className="text-sm font-bold text-success">E-mail enviado!</p>
                <p className="text-xs text-text-secondary mt-1">
                  Enviamos o link de recuperação para{" "}
                  <strong className="text-text-primary">{email}</strong>.
                  Verifique também o spam.
                </p>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-xs text-text-muted">Não recebeu o e-mail?</p>
              <button
                onClick={() => { setSuccess(false); setEmail(""); }}
                className="text-xs text-arkos-blue-light hover:text-arkos-gold transition-colors font-semibold"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-danger/10 border border-danger/30">
                <AlertCircle className="h-4 w-4 text-danger shrink-0" />
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">
                E-mail da sua conta
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@empresa.com.br"
                  required
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
                <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
              ) : (
                "Enviar link de recuperação"
              )}
            </button>
          </form>
        )}

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
