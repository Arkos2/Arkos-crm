# Checklist de deploy no Cloudflare Pages (grátis)

## 1) Variáveis de ambiente (Cloudflare Pages > Settings > Variables)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` (público)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (público)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- [ ] `GEMINI_API_KEY` (sua chave do Google AI Studio)
- [ ] `META_VERIFY_TOKEN` (opcional)
- [ ] `META_ACCESS_TOKEN` (opcional)

## 2) Bucket e políticas Supabase
- [ ] Criar bucket `crm-uploads` em Storage
- [ ] Definir política pública de leitura (ou usar signed URLs via server)
- [ ] Criar tabela `crm_entries` com colunas: id, file_url, file_name, mime_type, extracted_data json, created_at

## 3) Configuração local e build
- [ ] Copiar `.env.example` para `.env.local` e preencher com teste (não commitar .env.local)
- [ ] `npm install`
- [ ] `npm run build` deve passar
- [ ] Testar upload + análise localmente

## 4) Cloudflare Pages
- [ ] Criar projeto Pages no Cloudflare e conectar ao GitHub repo
- [ ] Em Build command: `npm run build`
- [ ] Em Output directory: `.next` (detectado automaticamente)
- [ ] Em Compatibility flags: marcar `nodejs_compat`
- [ ] Em Environment variables: colar as mesmas do passo 1

## 5) Domain e HTTPS
- [ ] Configurar domínio próprio (opcional) ou usar o *.pages.dev
- [ ] Forçar HTTPS no Cloudflare (padrão)

## 6) Webhook Meta/WhatsApp (opcional)
- [ ] Configurar webhook no Meta Business com a URL pública da Cloudflare (ex: https://seu-dominio.pages.dev/api/webhook)
- [ ] Definir `META_VERIFY_TOKEN` e `META_ACCESS_TOKEN`

## 7) Segurança
- [ ] Nunca enviar `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY` ou `META_ACCESS_TOKEN` para o frontend
- [ ] Usar `NEXT_PUBLIC_*` apenas para chaves realmente públicas
- [ ] Revisar políticas do bucket para evitar acesso público indevido

## 8) Monitoramento
- [ ] Verificar limites: Gemini 1M tokens/mês grátis, Supabase 500MB armazenamento
- [ ] Acompanhar logs no Cloudflare > Workers > Logs

## Comandos úteis
- Build local: `npm run build`
- Dev local: `npm run dev`
- Deploy Cloudflare: via Painel Cloudflare ou `wrangler pages deploy` (precisa wrangler instalado)

Próximos passos: ajustar `src/lib/gemini.ts`, `src/app/upload/actions.ts`, `next.config.mjs` e `middleware.ts`.