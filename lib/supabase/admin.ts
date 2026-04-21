import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Importante: Este cliente usa a SERVICE_ROLE_KEY, o que significa que
// ele IGNORA o Row Level Security (RLS). Deve ser usado EXCLUSIVAMENTE
// em rotas de API server-side (como webhooks, agentes de IA), e nunca exportado
// pua componentes client-side.
export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase Admin credentials");
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
