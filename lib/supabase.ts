// lib/supabase.ts
import { supabase as clientSupabase } from './supabase/client'

// Exportamos a mesma instância usada pelo SSR para garantir consistência de sessão
// e evitar o erro de "lock stolen" causado por múltiplas instâncias do Supabase.
export const supabase = clientSupabase

