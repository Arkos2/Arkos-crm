-- 1. EXTENSÕES ÚTEIS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ALTERAÇÕES NA TABELA DE LEADS EXISTENTE
-- Adiciona apenas as colunas que faltam para o modelo BANT sem apagar dados
ALTER TABLE public.leads 
    ADD COLUMN IF NOT EXISTS telefone VARCHAR(50) UNIQUE,
    ADD COLUMN IF NOT EXISTS faturamento_mensal NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS nivel_urgencia VARCHAR(50) DEFAULT 'Normal',
    ADD COLUMN IF NOT EXISTS score_ia INTEGER DEFAULT 0;

-- Índices de busca super-rápida pedidos pelo cliente
CREATE INDEX IF NOT EXISTS idx_leads_telefone ON public.leads(telefone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);


-- 3. TABELA DE MENSAGENS E IDEMPOTÊNCIA (WEBHOOK)
-- Armazena o contexto pro Claude 3.7 e evita que o WhatsApp processe a mesma mensagem 2x
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    wa_message_id VARCHAR(255) UNIQUE NOT NULL, -- IDEMPOTÊNCIA: ID único da mensagem vindo da Meta API
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índice para a checagem de idempotência ser ultra-rápida
CREATE INDEX IF NOT EXISTS idx_wa_message_id ON public.messages(wa_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON public.messages(lead_id);


-- 4. TABELA DE TELEMETRIA (BI ANALYTICS)
CREATE TABLE IF NOT EXISTS public.metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ai_calls_count INTEGER DEFAULT 0,
    cost_estimated NUMERIC DEFAULT 0,
    leads_qualified INTEGER DEFAULT 0,
    potential_revenue_mapped NUMERIC DEFAULT 0,
    date_recorded DATE DEFAULT CURRENT_DATE UNIQUE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TRIGGERS (Opcional, atualiza o campo updated_at automaticamente)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- 6. TABELA DE PERFIS (AUTH)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'seller'
    CHECK (role IN ('admin', 'manager', 'seller', 'viewer')),
  phone TEXT,
  department TEXT,
  company_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Usuário vê seu próprio perfil
DROP POLICY IF EXISTS "users_view_own_profile" ON public.profiles;
CREATE POLICY "users_view_own_profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Usuário edita seu próprio perfil
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin vê todos
DROP POLICY IF EXISTS "admin_view_all_profiles" ON public.profiles;
CREATE POLICY "admin_view_all_profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Auto-criação na inserção
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.profiles;
CREATE POLICY "users_insert_own_profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger para updated_at na tabela profiles
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. TRIGGER: CRIAR PERFIL AUTOMÁTICO NO SIGNUP
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, first_name, last_name, company_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    SPLIT_PART(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1),
    SUBSTR(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), POSITION(' ' IN COALESCE(NEW.raw_user_meta_data->>'full_name', '')) + 1),
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
