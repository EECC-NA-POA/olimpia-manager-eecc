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

- Migrações ficam em `supabase/migrations/` mas são **executadas MANUALMENTE** pelo usuário no SQL Editor do Studio (`studio-sb.nova-acropole.org.br`, acesso via **VPN**). O deploy da Lovable **NÃO** roda migração — só publica o frontend. Sempre avise o usuário quais migrações rodar após o merge, em linguagem clara de "isto ainda não está em produção até você rodar X no Studio".
- Objetos não versionados (views/triggers/RPCs/**RLS policies**) só existem no banco. Antes de alterar uma view como `vw_analytics_inscricoes` ou uma policy de RLS, **peça/obtenha a definição atual** (o usuário pode colar do Studio) e reescreva a partir dela — **nunca assuma** o que uma policy faz.
- O **MCP do Supabase aponta para outro projeto (vazio)** — NÃO use `mcp__supabase__*` para este banco. Para leitura de diagnóstico, use a REST API com a anon key do `.env` (só leitura; RLS bloqueia escrita anônima e muitas tabelas). Endpoint OpenAPI (`/rest/v1/`) lista colunas de tudo.
- **Auth:** a anon key é **não-JWT**; requisições anônimas via client JS mandam Bearer inválido (use `apikey` header em `publicFetch` para chamadas públicas). Requisições **autenticadas** (pós-login) carregam o JWT do usuário, então `auth.uid()` **resolve** em RLS e RPCs `SECURITY DEFINER`.

## Regras invioláveis

- **NUNCA** hardcode `VITE_SUPABASE_ANON_KEY` — só via `import.meta.env.VITE_SUPABASE_ANON_KEY`.
- Entregar soluções **definitivas, sem erros visíveis ao usuário final** (tratar loading/erro, não deixar mensagem genérica).
- **NUNCA confie em RLS sem ver a definição real.** Este projeto já teve policies com `role=public, qual=true` (liberando escrita a usuários não-autenticados) e junções sem correlacionar o chamador ao registro-alvo (ver "Auditoria de segurança" abaixo). Antes de declarar uma tabela "protegida", peça o dump de `pg_policies` — não assuma pelo nome da policy.

## Modelo de autorização (RPCs `SECURITY DEFINER`)

Escritas em tabelas sensíveis (`pagamentos`, `papeis_usuarios`) devem passar por **RPC `SECURITY DEFINER`**, nunca por `.from(tabela).update()/.insert()` direto do front — a RLS de UPDATE/INSERT nessas tabelas é deliberadamente restritiva (self-service limitado) desde a auditoria de 2026-07. Padrão a replicar (ver `conceder_isencao`, `atualizar_status_pagamento`, `atualizar_valor_pagamento` em `supabase/migrations/`):

```sql
CREATE OR REPLACE FUNCTION public.minha_rpc(p_atleta_id uuid, p_evento_id uuid, ...)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_is_admin_org boolean; v_is_rdd boolean; v_atleta_filial uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Usuário não autenticado'; END IF;
  SELECT bool_or(pt.codigo IN ('ADM','ORG','ORE')), bool_or(pt.codigo = 'RDD')
    INTO v_is_admin_org, v_is_rdd
    FROM papeis_usuarios pu JOIN perfis p ON p.id=pu.perfil_id JOIN perfis_tipo pt ON pt.id=p.perfil_tipo_id
    WHERE pu.usuario_id = v_uid AND pu.evento_id = p_evento_id;
  IF COALESCE(v_is_admin_org, false) THEN NULL; -- qualquer atleta do evento
  ELSIF COALESCE(v_is_rdd, false) THEN
    SELECT filial_id INTO v_atleta_filial FROM usuarios WHERE id = p_atleta_id;
    IF v_atleta_filial <> ALL (get_user_delegacao_filiais(v_uid, p_evento_id)) THEN
      RAISE EXCEPTION 'Sem permissão: atleta fora da sua delegação'; END IF;
  ELSE RAISE EXCEPTION 'Sem permissão'; END IF;
  -- ... UPDATE/INSERT + trilha em <tabela>_audit_log
END; $$;
```

Auditoria (`pagamentos_audit_log`, `chamadas_audit_log`, `papeis_audit_log`): SELECT restrito a ADM/ORG/ORE(/MST) do **mesmo evento do registro** (nunca `USING(true)` — já corrigimos esse erro duas vezes nesta base).

## Auditoria de segurança (2026-07) — histórico e lições

Auditoria completa (13 eixos: segredos, authz, RLS, deps, LGPD etc.) rodada em 2026-07; achados corrigidos em `supabase/migrations/20260703_*` a `20260705_*` — ver essas migrações para o detalhe de cada fix. Resumo do que mudou e o que **não repetir**:

- **`.env` não é mais versionado** (`.gitignore` cobre `*-adminsdk-*.json`/`*service-account*.json`); nunca commitar segredos de servidor (`service_role`, private keys) — só em variáveis de ambiente do host.
- **RPCs de pagamento/papéis** (`atualizar_status_pagamento`, `atualizar_valor_pagamento`, `assign_user_profiles`, `swap_user_profile`, `process_dependent_registration`) validam papel do chamador — seguir o padrão acima em qualquer RPC nova sobre essas tabelas.
- **RLS mais crítica encontrada:** `papeis_usuarios` tinha policy `role=public` com `qual=true`/`with_check=true` — permitia auto-atribuição de **qualquer papel** (inclusive ADM) **sem login**, contornando toda RPC segura. `pagamentos` tinha uma policy de RDD sem correlacionar `pu.usuario_id`/`pu.evento_id` ao chamador/evento — qualquer autenticado controlava pagamento de qualquer atleta da própria filial. **Lição:** ao escrever/revisar uma policy, sempre correlacione explicitamente `pu.usuario_id = auth.uid()` e `pu.evento_id = <evento do registro-alvo>` — nunca deixe um `EXISTS` sem essa correlação.
- Rotas `/monitor` e `/delegacao` agora têm guarda de papel (padrão: `useEffect` + `toast.error` + `navigate('/')`, ver `src/pages/Administration.tsx`). Ao criar uma rota nova sob papel restrito, **sempre** adicionar essa guarda — não confiar só em esconder o item de menu.
- `vite.config.ts`: `esbuild.drop` remove `console.*` em produção (evita vazar PII); plugin `transformIndexHtml` remove o script `cdn.gpteng.co/gptengineer.js` (edição visual da Lovable) do build de produção, mantendo-o em dev.
- Edge Functions `process-event-registration` e `send-payment-proof` foram **removidas** (usavam `service_role` sem checar JWT/vínculo, e eram órfãs — nada no app as invocava). Antes de criar uma Edge Function nova, confirmar que algo realmente a chama (`supabase.functions.invoke`) e que ela valida o JWT do chamador se não for `SECURITY DEFINER`-equivalente.
- **Follow-up conhecido, não corrigido (baixa prioridade):** `inscricoes_eventos_select_policy` permite SELECT amplo (`qual=true`) a qualquer autenticado — não corrigido para evitar quebrar dashboards que dependem dessa leitura ampla sem auditoria prévia de todos os consumidores. Revisar se for mexer nessa tabela.
- **Bug funcional conhecido, não é segurança:** `storageService.ts` usa `getPublicUrl` no bucket `payment-proofs`, que é **privado** (`public=false`, confirmado) — a URL gerada não abre. Devia usar `createSignedUrl` (já existe `getSignedPaymentProofUrl` no código, subutilizado).

## Papéis de usuário

Códigos em `perfis_tipo.codigo`, atribuídos por evento (`papeis_usuarios → perfis → perfis_tipo`). No front chegam em `useAuth().user.papeis` (`{ codigo, nome, descricao }`). Detecção: `user?.papeis?.some(r => r.codigo === 'ADM')`.

- **ADM** Administrador · **ORG** Organizador (variante legada `ORE`) · **RDD** Representante de Delegação (escopo por `get_user_delegacao_filiais`) · **ATL** Atleta · **PGR** Responsável/Guardião · **JUZ** Juiz · **MST/MSTR** Master · **FMON/FMO** Filósofo Monitor.
- Detalhes e permissões em `docs/PAPEIS_E_PERMISSOES.md`.

## Documentação do sistema (aba Documentações)

A página Administração (`src/pages/Administration.tsx`, só ADM) tem uma aba **Documentações** que renderiza markdown de `docs/`. Para **adicionar um novo documento**:

1. Criar o arquivo em `docs/NOME.md`.
2. Adicionar uma entrada em `src/lib/docs/registry.ts`: `import x from '../../../docs/NOME.md?raw'` + `{ slug, title, description, category, updatedAt, content: x }`. Categorias: `Referência | Atualização | Melhoria | Correção`.

O conteúdo é embutido no build via import **`?raw`** do Vite (sem fetch em runtime). Render por `react-markdown` + `remark-gfm` + classes `prose` (componente `EventDocumentationsSection.tsx`). Use este local para changelog de correções/melhorias.

Docs já registrados (`src/lib/docs/registry.ts`): **Papéis e Permissões**, **Modelo de Pagamento**, **Guia de Teste de Fluxo** (roteiro de validação com usuários, evento "Olimpíadas Estaduais").

## Verificação antes de PR

- Sempre `npx tsc --noEmit`.
- Se mexer em imports `?raw` (ou qualquer coisa que o `tsc` não valida), rode também **`npx vite build`** — o `tsc` sozinho não pega esses imports.
