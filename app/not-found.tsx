"use client";

import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-arkos-bg flex items-center justify-center p-6 text-center">
      <div className="space-y-6">
        <h1 className="text-6xl font-black text-arkos-gold">404</h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-text-primary">
            Página não encontrada
          </h2>
          <p className="text-text-secondary max-w-md mx-auto">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="gold" size="lg" className="mt-4">
            Voltar para o Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
