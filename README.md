<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Controle de Ferramentas

Aplicacao React + TypeScript + Vite para controle de retiradas e devolucoes de ferramentas, publicada no Vercel.

View your app in AI Studio: <https://ai.studio/apps/98bed0f2-aae4-42a8-bd5c-5d5a355a050f>

## Executar localmente

Pre-requisito: Node.js.

1. Instale as dependencias:
   `npm install`
2. Copie `.env.example` para `.env.local` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. Execute:
   `npm run dev`

## Configurar o Supabase

1. Crie um projeto no Supabase.
2. Abra o SQL Editor e execute [`supabase-schema.sql`](supabase-schema.sql).
3. Em Project Settings > API, copie a URL e a chave `anon`/publica para `.env.local`.
4. No Vercel, cadastre as mesmas variaveis em Settings > Environment Variables e faca um novo deploy.

Sem essas variaveis, a aplicacao usa o `localStorage` apenas como fallback local. A pasta `streamlit/` nao participa deste build.
