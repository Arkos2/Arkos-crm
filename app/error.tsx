"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro (em produção, enviar para Sentry/Datadog)
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-arkos-bg flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">

        <div className="w-16 h-16 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-8 w-8 text-danger" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Algo deu errado
          </h1>
          <p className="text-text-secondary text-sm mt-2">
            Ocorreu um erro inesperado. Nossa equipe foi notificada.
          </p>
          {error.digest && (
            <p className="text-xs text-text-muted mt-2 font-mono">
              ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-arkos-blue text-white font-semibold text-sm hover:bg-arkos-blue-light transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
          <Link href="/dashboard">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl border border-arkos-border text-text-secondary hover:text-text-primary font-semibold text-sm transition-all">
              <Home className="h-4 w-4" />
              Ir para Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
