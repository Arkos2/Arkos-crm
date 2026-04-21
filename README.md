# ARKOS OS - Ecossistema AI SDR & Automação Comercial

A **ARKOS** não é apenas uma agência, é uma consultoria de "Arquitetura de Processos e Ordem Superior". Este repositório encapsula o **ARKOS OS**: nosso CRM nativo, turbinado por Agentes Avançados (Claude 3.7 Sonnet) e Integração Direta com WhatsApp (Meta API).

## 🚀 Arquitetura e Stack
- **Frontend & Webhook API:** Next.js 14 (App Router) + Tailwind CSS (Dark Mode Premium Navy/Gold) + Shadcn/UI
- **Backend Oculto (Serverless):** Next.js Route Handlers (`/app/api`) operando em Edge/Node Runtime
- **Database Real-Time:** Supabase (PostgreSQL)
- **Motor de Inteligência AI:** @anthropic-ai/sdk (Modelo: `claude-3-7-sonnet-20250219`)

## 🛠 Setup & Variáveis de Ambiente (Deploy)

Para rodar este projeto localmente ou subir para a **Vercel**, você precisará do seguinte arquivo `.env.local`:

```env
# Banco de Dados (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://sua-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-longa

# Inteligência Artificial (Anthropic Claude 3.7)
ANTHROPIC_API_KEY=sk-ant-api03-sua-chave-aqui

# Integração WhatsApp (Meta Webhook API)
META_VERIFY_TOKEN=ARKOS_VERIFY_2026
META_ACCESS_TOKEN=EAALXYZ...
```

## 📦 Deploy para a Vercel

Por utilizarmos **Next.js 14**, o Deploy mais recomendado é na **Vercel** (não requer Railway/Render para a API, cortando custos e mantendo tudo Serverless).

1. Suba este repositório para o seu GitHub privado.
2. Crie uma conta ou acesse [Vercel.com](https://vercel.com).
3. Conecte o repositório GitHub.
4. Na tela de Configurações do Projeto na Vercel, abra aba **"Environment Variables"** e cole todas as variáveis acima.
5. Clique em **Deploy**. Vercel cuidará de tudo (Frontend + Webhook API).

Após o deploy, a URL do seu Webhook a ser inserida no painel da Meta for Developers será:
`https://seu-dominio.vercel.app/api/webhook`

## 💳 Diferenciais de Engenharia
- **Idempotência no Webhook**: O nosso gateway Meta (`/api/webhook`) bloqueia mensagens repetidas (mesmo `message_id`) garantindo custo 0 contra reenvios/bugs da Meta.
- **Thinking Block**: O Agente SDR 'Lucas' tem raciocínio em profundidade ativo (SPIN Selling/BANT) antes de falar.
- **Tool Use (Atuação Integrada)**: O Claude atualiza o Banco de Dados autonomamente se classificar o tamanho do faturamento conversado.
