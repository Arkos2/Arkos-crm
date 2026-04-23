-- 1. EXTENSÕES ÚTEIS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PIPELINES ───
CREATE TABLE IF NOT EXISTS public.pipelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    currency TEXT DEFAULT 'R$',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PIPELINE STAGES ───
CREATE TABLE IF NOT EXISTS public.pipeline_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipeline_id UUID REFERENCES public.pipelines(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    probability INTEGER DEFAULT 0,
    color TEXT DEFAULT '#60a5fa',
    rotting_after_days INTEGER DEFAULT 7,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ORGANIZATIONS ───
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    industry TEXT,
    size TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CONTACTS ───
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    job_title TEXT,
    is_decision_maker BOOLEAN DEFAULT false,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DEALS ───
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    pipeline_id UUID REFERENCES public.pipelines(id) ON DELETE SET NULL,
    stage TEXT NOT NULL DEFAULT 'prospecting',
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    value NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'R$',
    probability NUMERIC DEFAULT 0,
    expected_close_date DATE,
    bant_budget NUMERIC DEFAULT 0,
    bant_authority NUMERIC DEFAULT 0,
    bant_need NUMERIC DEFAULT 0,
    bant_timeline NUMERIC DEFAULT 0,
    bant_total NUMERIC DEFAULT 0,
    current_state TEXT,
    desired_state TEXT,
    gap_level TEXT DEFAULT 'low',
    urgency NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost')),
    temperature TEXT DEFAULT 'warm' CHECK (temperature IN ('hot', 'warm', 'cold', 'rotting')),
    lost_reason TEXT,
    ai_score NUMERIC,
    ai_suggestions JSONB DEFAULT '[]'::jsonb,
    last_activity_at TIMESTAMPTZ,
    stage_entered_at TIMESTAMPTZ DEFAULT NOW(),
    won_at TIMESTAMPTZ,
    lost_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ACTIVITIES ───
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_ai BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── WORKFLOWS ───
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL,
    actions JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── NOTIFICATIONS ───
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── GOALS ───
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    period TEXT NOT NULL,
    target_value NUMERIC NOT NULL,
    current_value NUMERIC DEFAULT 0,
    unit TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── USER POINTS ───
CREATE TABLE IF NOT EXISTS public.user_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    total_points INTEGER DEFAULT 0,
    monthly_points INTEGER DEFAULT 0,
    weekly_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    level_name TEXT DEFAULT 'Iniciante',
    level_progress INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- APLICANDO O RLS AGORA QUE A TABELA EXISTE
-- ==========================================

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Visualizar próprios negócios" ON public.deals;
CREATE POLICY "Visualizar próprios negócios" ON public.deals
    FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Criar próprios negócios" ON public.deals;
CREATE POLICY "Criar próprios negócios" ON public.deals
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Atualizar próprios negócios" ON public.deals;
CREATE POLICY "Atualizar próprios negócios" ON public.deals
    FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Deletar próprios negócios" ON public.deals;
CREATE POLICY "Deletar próprios negócios" ON public.deals
    FOR DELETE USING (auth.uid() = owner_id);
