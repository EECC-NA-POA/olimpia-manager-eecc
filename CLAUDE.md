# CLAUDE.md — olimpia-manager-eecc

Guia para agentes de IA trabalhando neste repositório. Leia antes de propor mudanças.

## Visão geral

Sistema de gestão de olimpíadas/eventos esportivos da Nova Acrópole Brasil (produção: `olimpia.nova-acropole.org.br`). React 18 + TypeScript + Vite + shadcn/ui + Tailwind. Hospedado na **Lovable.dev**. Dados no **Supabase self-hosted** (`sb.nova-acropole.org.br`). Data fetching com TanStack React Query.

## Fluxo de trabalho (OBRIGATÓRIO)

- **Produção builda automaticamente da branch `main`** — merge em `main` = deploy.
- Toda mudança vai por **feature branch → PR → merge em `main`**. Nunca commitar direto na `main`.
- Mensagens de commit/PR: pode usar ASCII simples (o ambiente às vezes quebra acentos no shell).
- Após o deploy, mudanças podem exigir **Ctrl+Shift+R** (cache de bundle na Lovable).

## Banco de dados — LEIA COM ATENÇÃO

- Migrações ficam em `supabase/migrations/` mas são **executadas MANUALMENTE** pelo usuário no SQL Editor do Studio (`studio-sb.nova-acropole.org.br`, acesso via **VPN**). O deploy da Lovable **NÃO** roda migração — só publica o frontend. Sempre avise o usuário quais migrações rodar após o merge.
- Objetos não versionados (views/triggers/RPCs) só existem no banco. Antes de alterar uma view como `vw_analytics_inscricoes`, **peça/obtenha a definição atual** (o usuário pode colar do Studio) e reescreva a partir dela.
- O **MCP do Supabase aponta para outro projeto (vazio)** — NÃO use `mcp__supabase__*` para este banco. Para leitura de diagnóstico, use a REST API com a anon key do `.env` (só leitura; RLS bloqueia escrita anônima e muitas tabelas). Endpoint OpenAPI (`/rest/v1/`) lista colunas de tudo.
- **Auth:** a anon key é **não-JWT**; requisições anônimas via client JS mandam Bearer inválido (use `apikey` header em `publicFetch` para chamadas públicas). Requisições **autenticadas** (pós-login) carregam o JWT do usuário, então `auth.uid()` **resolve** em RLS e RPCs `SECURITY DEFINER`.

## Regras invioláveis

- **NUNCA** hardcode `VITE_SUPABASE_ANON_KEY` — só via `import.meta.env.VITE_SUPABASE_ANON_KEY`.
- Entregar soluções **definitivas, sem erros visíveis ao usuário final** (tratar loading/erro, não deixar mensagem genérica).

## Papéis de usuário

Códigos em `perfis_tipo.codigo`, atribuídos por evento (`papeis_usuarios → perfis → perfis_tipo`). No front chegam em `useAuth().user.papeis` (`{ codigo, nome, descricao }`). Detecção: `user?.papeis?.some(r => r.codigo === 'ADM')`.

- **ADM** Administrador · **ORG** Organizador (variante legada `ORE`) · **RDD** Representante de Delegação (escopo por `get_user_delegacao_filiais`) · **ATL** Atleta · **PGR** Responsável/Guardião · **JUZ** Juiz · **MST/MSTR** Master · **FMON/FMO** Filósofo Monitor.
- Detalhes e permissões em `docs/PAPEIS_E_PERMISSOES.md`.

## Documentação do sistema (aba Documentações)

A página Administração (`src/pages/Administration.tsx`, só ADM) tem uma aba **Documentações** que renderiza markdown de `docs/`. Para **adicionar um novo documento**:

1. Criar o arquivo em `docs/NOME.md`.
2. Adicionar uma entrada em `src/lib/docs/registry.ts`: `import x from '../../../docs/NOME.md?raw'` + `{ slug, title, description, category, updatedAt, content: x }`. Categorias: `Referência | Atualização | Melhoria | Correção`.

O conteúdo é embutido no build via import **`?raw`** do Vite (sem fetch em runtime). Render por `react-markdown` + `remark-gfm` + classes `prose` (componente `EventDocumentationsSection.tsx`). Use este local para changelog de correções/melhorias.

## Verificação antes de PR

- Sempre `npx tsc --noEmit`.
- Se mexer em imports `?raw` (ou qualquer coisa que o `tsc` não valida), rode também **`npx vite build`** — o `tsc` sozinho não pega esses imports.
