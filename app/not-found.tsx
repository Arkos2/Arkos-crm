import Link from "next/link";
import { Zap, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-arkos-bg flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-arkos-blue-light to-arkos-blue flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-black text-text-primary">ARKOS CRM</span>
        </div>

        {/* 404 */}
        <div>
          <p className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-arkos-blue-light to-arkos-blue">404</p>
          <h1 className="text-2xl font-bold text-text-primary mt-4">
            Página não encontrada
          </h1>
          <p className="text-text-secondary text-sm mt-2">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-arkos-gold-light to-arkos-gold text-arkos-bg font-semibold text-sm hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all">
              <Home className="h-4 w-4" />
              Ir para o Dashboard
            </button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-arkos-border text-text-secondary hover:text-text-primary hover:border-arkos-border-2 font-semibold text-sm transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
