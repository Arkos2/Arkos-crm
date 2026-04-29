import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "../env";

// Importante: Este cliente usa a SERVICE_ROLE_KEY, o que significa que
// ele IGNORA o Row Level Security (RLS). Deve ser usado EXCLUSIVAMENTE
// em rotas de API server-side (como webhooks, agentes de IA), e nunca exportado
// pua componentes client-side.
export function createAdminClient() {
  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase Admin credentials (URL or Service Role Key)");
  }

  return createSupabaseClient(
    url,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
