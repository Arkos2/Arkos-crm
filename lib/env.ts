/**
 * Utilitário robusto para buscar variáveis de ambiente no Cloudflare Workers.
 * Tenta buscar de múltiplas fontes para garantir compatibilidade com OpenNext.
 */
export function getEnv(key: string): string | undefined {
  // 1. Tentar process.env (Padrão Node.js/Next.js)
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }

  // 2. Tentar globalThis (Algumas versões do OpenNext/Cloudflare injetam aqui)
  if (typeof globalThis !== "undefined" && (globalThis as any)[key]) {
    return (globalThis as any)[key];
  }

  // NÃO fazer fallback para NEXT_PUBLIC_ — chaves sensíveis
  // seriam expostas no browser. Use variáveis server-side apenas.

  return undefined;
}

export function requireEnv(key: string): string {
  const value = getEnv(key);
  if (!value) {
    throw new Error(`Variável de ambiente ${key} não encontrada. Verifique as configurações no painel da Cloudflare.`);
  }
  return value;
}
