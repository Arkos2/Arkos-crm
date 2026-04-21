-- ═══════════════════════════════════════════════════════════
-- ARKOS CRM — Seeds (dados iniciais)
-- Execute APÓS o schema.sql e APÓS criar o usuário demo
-- ═══════════════════════════════════════════════════════════

-- Busca o ID do usuário demo
DO $$
DECLARE
  demo_id UUID;
  org1_id UUID;
  org2_id UUID;
  org3_id UUID;
  org4_id UUID;
  ct1_id UUID;
  ct2_id UUID;
  ct3_id UUID;
  ct4_id UUID;
  pipe_id UUID;
BEGIN

  -- Pegar ID do usuário demo
  SELECT id INTO demo_id
  FROM public.profiles
  WHERE email = 'demo@arkos.com.br'
  LIMIT 1;

  IF demo_id IS NULL THEN
    RAISE NOTICE 'Usuário demo não encontrado. Crie o usuário primeiro.';
    RETURN;
  END IF;

  -- Criar pipeline padrão se não existir
  INSERT INTO public.pipelines (name, is_default, currency)
  VALUES ('Pipeline Comercial', TRUE, 'R$')
  ON CONFLICT DO NOTHING;

  -- Pegar ID do pipeline padrão
  SELECT id INTO pipe_id
  FROM public.pipelines
  WHERE is_default = TRUE
  LIMIT 1;

  -- Criar etapas se não existirem
  INSERT INTO public.pipeline_stages (pipeline_id, name, probability, color, rotting_after_days, "order")
  VALUES 
    (pipe_id, 'prospecting', 10, '#94a3b8', 7, 1),
    (pipe_id, 'qualification', 20, '#60a5fa', 5, 2),
    (pipe_id, 'diagnosis', 40, '#818cf8', 5, 3),
    (pipe_id, 'proposal', 60, '#fbbf24', 3, 4),
    (pipe_id, 'negotiation', 80, '#f59e0b', 3, 5),
    (pipe_id, 'closing', 90, '#10b981', 2, 6)
  ON CONFLICT DO NOTHING;

  -- ─── ORGANIZAÇÕES ───
  INSERT INTO public.organizations (name, industry, size, website)
  VALUES
    ('SaúdeTec Hospital', 'Saúde', 'large', 'saudetec.com.br'),
    ('LogiMax Transportes', 'Logística', 'large', 'logimax.com.br'),
    ('EduPlus Cursos', 'Educação', 'small', 'eduplus.com.br'),
    ('TechCorp Brasil', 'Tecnologia', 'medium', 'techcorp.com.br')
  ON CONFLICT DO NOTHING;

  -- Capturar IDs das organizações criadas
  SELECT id INTO org1_id FROM public.organizations WHERE name = 'SaúdeTec Hospital';
  SELECT id INTO org2_id FROM public.organizations WHERE name = 'LogiMax Transportes';
  SELECT id INTO org3_id FROM public.organizations WHERE name = 'EduPlus Cursos';
  SELECT id INTO org4_id FROM public.organizations WHERE name = 'TechCorp Brasil';

  -- ─── CONTATOS ───
  INSERT INTO public.contacts
    (organization_id, first_name, last_name, email, phone, job_title, is_decision_maker)
  VALUES
    (org1_id, 'Dr. Paulo', 'Figueiredo', 'paulo@saudetec.com.br', '(11) 97654-3210', 'Diretor Médico', TRUE),
    (org2_id, 'Fernanda', 'Rocha', 'fernanda@logimax.com.br', '(11) 96543-2109', 'COO', TRUE),
    (org3_id, 'Rafael', 'Costa', 'rafael@eduplus.com.br', '(11) 98765-4321', 'CEO', TRUE),
    (org4_id, 'Carlos', 'Mendes', 'carlos@techcorp.com.br', '(11) 99234-5678', 'Diretor Financeiro', TRUE)
  ON CONFLICT DO NOTHING;

  SELECT id INTO ct1_id FROM public.contacts WHERE email = 'paulo@saudetec.com.br';
  SELECT id INTO ct2_id FROM public.contacts WHERE email = 'fernanda@logimax.com.br';
  SELECT id INTO ct3_id FROM public.contacts WHERE email = 'rafael@eduplus.com.br';
  SELECT id INTO ct4_id FROM public.contacts WHERE email = 'carlos@techcorp.com.br';

  -- ─── DEALS ───
  INSERT INTO public.deals (
    title, pipeline_id, stage, contact_id, organization_id, owner_id,
    value, probability, expected_close_date,
    bant_budget, bant_authority, bant_need, bant_timeline,
    current_state, desired_state, gap_level, urgency,
    status, temperature, last_activity_at, stage_entered_at
  ) VALUES
  (
    'Sistema de Gestão Hospitalar',
    pipe_id, 'diagnosis', ct1_id, org1_id, demo_id,
    120000, 40, '2025-02-28',
    25, 25, 25, 20,
    'Prontuários físicos, agendamentos por telefone, sem integração entre setores.',
    'Sistema integrado com prontuário eletrônico, agendamento online e BI clínico.',
    'high', 5,
    'active', 'hot', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
  ),
  (
    'Automação Logística — WMS',
    pipe_id, 'proposal', ct2_id, org2_id, demo_id,
    85000, 60, '2025-02-10',
    22, 25, 23, 23,
    'Controle de estoque manual, perda de 15% por falhas de inventário.',
    'WMS integrado com redução de perdas para menos de 2%.',
    'high', 5,
    'active', 'hot', NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '2 days'
  ),
  (
    'Plataforma de Vendas B2B',
    pipe_id, 'qualification', ct3_id, org3_id, demo_id,
    35000, 25, '2025-02-20',
    20, 25, 22, 18,
    'Vendas feitas apenas por indicação, sem processo estruturado.',
    'CRM e automação para escalar de 10 para 100 clientes/mês.',
    'high', 5,
    'active', 'hot', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 days'
  ),
  (
    'Implementação ERP Completa',
    pipe_id, 'prospecting', ct4_id, org4_id, demo_id,
    45000, 10, '2025-03-15',
    18, 15, 22, 10,
    'Controle financeiro manual com planilhas Excel.',
    'Automatizar 80% do processo financeiro com dashboards em tempo real.',
    'high', 4,
    'active', 'warm', NOW() - INTERVAL '3 days', NOW() - INTERVAL '5 days'
  )
  ON CONFLICT DO NOTHING;

  -- ─── ATIVIDADES ───
  INSERT INTO public.activities (deal_id, user_id, type, title, description, is_ai)
  SELECT
    d.id,
    demo_id,
    'meeting',
    'Reunião de Diagnóstico — 90min',
    'Mapeamento completo dos processos. Cliente confirmou urgência para Q1.',
    FALSE
  FROM public.deals d WHERE d.title = 'Sistema de Gestão Hospitalar'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.activities (deal_id, user_id, type, title, description, is_ai)
  SELECT
    d.id,
    demo_id,
    'ai_action',
    'Resumo de reunião gerado pela IA',
    'Pontos-chave: urgência alta, budget aprovado pelo board, decisão em 30 dias.',
    TRUE
  FROM public.deals d WHERE d.title = 'Sistema de Gestão Hospitalar'
  ON CONFLICT DO NOTHING;

  -- ─── WORKFLOWS ───
  INSERT INTO public.workflows (name, description, trigger_type, actions, status, created_by)
  VALUES
  (
    'Qualificação Automática — Inbound',
    'Quando um lead chega pelo site, o Agente Qualificador inicia conversa automaticamente',
    'lead_inbound',
    '[{"id":"a1","type":"ai_qualify","order":1,"config":{"agent":"qualifier"},"label":"Agente Qualificador inicia conversa"},{"id":"a2","type":"create_task","order":2,"delayMinutes":30,"config":{"title":"Revisar qualificação do Agente IA","priority":"high"},"label":"Criar tarefa de revisão"}]'::jsonb,
    'active',
    demo_id
  ),
  (
    'Alerta — Proposta Visualizada',
    'Notifica o vendedor imediatamente quando o cliente abre a proposta',
    'proposal_viewed',
    '[{"id":"b1","type":"notify_user","order":1,"config":{"message":"🔥 Cliente abriu sua proposta! Ligue agora.","channel":"push"},"label":"Notificar vendedor"},{"id":"b2","type":"create_task","order":2,"config":{"title":"Ligar — proposta aberta","priority":"urgent"},"label":"Criar tarefa urgente"}]'::jsonb,
    'active',
    demo_id
  )
  ON CONFLICT DO NOTHING;

  -- ─── NOTIFICAÇÕES INICIAIS ───
  INSERT INTO public.notifications (user_id, title, message, type, action_url)
  VALUES
  (demo_id, '👋 Bem-vindo ao ARKOS CRM!', 'Seu CRM com IA está pronto. Explore o pipeline e os agentes.', 'success', '/dashboard'),
  (demo_id, '🔥 Proposta visualizada', 'Fernanda (LogiMax) abriu sua proposta 3x hoje. Ligue agora!', 'warning', '/pipeline'),
  (demo_id, '🤖 Agente Qualificador ativo', '3 conversas em andamento. BANT sendo coletado automaticamente.', 'info', '/agents/qualifier')
  ON CONFLICT DO NOTHING;

  -- ─── METAS DO MÊS ───
  INSERT INTO public.goals (user_id, type, period, target_value, current_value, unit, period_start, period_end)
  VALUES
  (demo_id, 'revenue', 'monthly', 150000, 125000, 'R$', '2025-01-01', '2025-01-31'),
  (demo_id, 'deals_closed', 'monthly', 10, 7, 'deals', '2025-01-01', '2025-01-31')
  ON CONFLICT DO NOTHING;

  -- ─── PONTOS INICIAIS ───
  INSERT INTO public.user_points
    (user_id, total_points, monthly_points, weekly_points, level, level_name, level_progress, streak_days)
  VALUES
    (demo_id, 8420, 2450, 680, 12, 'Vendedora Elite', 78, 13)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = 8420,
    monthly_points = 2450,
    level = 12,
    level_name = 'Vendedora Elite';

  RAISE NOTICE '✅ Seeds executados com sucesso! Dados criados para o usuário demo.';
END $$;
