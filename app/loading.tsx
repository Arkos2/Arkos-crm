import { Zap } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-arkos-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-arkos-blue/10 border border-arkos-blue/20 flex items-center justify-center">
            <Zap className="h-8 w-8 text-arkos-blue-light" />
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-arkos-blue/40 animate-ping" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-text-primary">ARKOS CRM</p>
          <p className="text-xs text-text-muted mt-0.5">Carregando...</p>
        </div>
      </div>
    </div>
  );
}
