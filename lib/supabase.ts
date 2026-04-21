// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Prevenção de erro no build da Vercel: Se as variáveis estiverem vazias, usamos strings "de mentira"
// para o build passar. No ar, a Vercel usará as suas chaves reais.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key-placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
