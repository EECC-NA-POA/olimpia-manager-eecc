-- ============================================================================
-- Pagina publica de divulgacao por evento (ex.: oficinas da EECC).
--
-- Nao confundir com eventos.visibilidade_publica: aquela flag so faz o evento
-- aparecer na lista de selecao de eventos para quem JA esta logado. As colunas
-- abaixo ligam uma pagina aberta, sem login, em /event/<slug> (e no subdominio
-- <slug>.nova-acropole.org.br, quando o DNS/hospedagem estiverem configurados).
--
-- A pagina le tudo por UMA RPC SECURITY DEFINER que devolve so os campos
-- necessarios (whitelist) e so para eventos com a pagina ligada. Nenhuma
-- policy de RLS de modalidades/cronograma/usuarios e aberta para anon.
--
-- ATENCAO (LGPD): para eventos com a pagina ligada, o NOME e o TELEFONE
-- (botao de WhatsApp) dos filosofos monitores das oficinas ficam publicos.
--
-- EXECUTAR MANUALMENTE no SQL Editor de sb.nova-acropole.org.br.
-- ============================================================================

ALTER TABLE public.eventos
  ADD COLUMN IF NOT EXISTS pagina_publica_ativa boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pagina_publica_slug  text,
  ADD COLUMN IF NOT EXISTS pagina_publica_texto text;

-- Slug vira caminho de URL e rotulo de subdominio: minusculas, numeros e hifen,
-- 3 a 50 caracteres, sem hifen nas pontas.
ALTER TABLE public.eventos DROP CONSTRAINT IF EXISTS eventos_pagina_publica_slug_formato;
ALTER TABLE public.eventos ADD CONSTRAINT eventos_pagina_publica_slug_formato
  CHECK (pagina_publica_slug IS NULL OR pagina_publica_slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$');

-- Pagina ligada exige slug.
ALTER TABLE public.eventos DROP CONSTRAINT IF EXISTS eventos_pagina_publica_exige_slug;
ALTER TABLE public.eventos ADD CONSTRAINT eventos_pagina_publica_exige_slug
  CHECK (NOT pagina_publica_ativa OR pagina_publica_slug IS NOT NULL);

CREATE UNIQUE INDEX IF NOT EXISTS eventos_pagina_publica_slug_key
  ON public.eventos (pagina_publica_slug)
  WHERE pagina_publica_slug IS NOT NULL;

-- ----------------------------------------------------------------------------
-- Leitura publica: evento + oficinas (modalidades) + horarios do cronograma
-- + filosofos monitores. Retorna NULL se o slug nao existir ou a pagina estiver
-- desligada.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_pagina_publica_evento(p_slug text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'evento', jsonb_build_object(
      'id', e.id,
      'nome', e.nome,
      'descricao', e.descricao,
      'texto', e.pagina_publica_texto,
      'foto_evento', e.foto_evento,
      'cidade', e.cidade,
      'estado', e.estado,
      'pais', e.pais,
      'data_inicio_evento', e.data_inicio_evento,
      'data_fim_evento', e.data_fim_evento,
      'data_inicio_inscricao', e.data_inicio_inscricao,
      'data_fim_inscricao', e.data_fim_inscricao,
      'status_evento', e.status_evento
    ),
    'oficinas', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', m.id,
        'nome', m.nome,
        'categoria', m.categoria,
        'faixa_etaria', m.faixa_etaria,
        'status', m.status,
        'horarios', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'atividade', ca.atividade,
            'dia', ca.dia,
            'horario_inicio', ca.horario_inicio,
            'horario_fim', ca.horario_fim,
            'local', ca.local,
            'recorrente', COALESCE(ca.recorrente, false),
            'dias_semana', to_jsonb(ca.dias_semana),
            'horarios_por_dia', ca.horarios_por_dia,
            'locais_por_dia', ca.locais_por_dia,
            'data_fim_recorrencia', ca.data_fim_recorrencia
          ) ORDER BY ca.dia NULLS LAST, ca.horario_inicio NULLS LAST)
          FROM public.cronograma_atividade_modalidades cam
          JOIN public.cronograma_atividades ca ON ca.id = cam.cronograma_atividade_id
          WHERE cam.modalidade_id = m.id
            AND ca.evento_id = e.id
        ), '[]'::jsonb),
        'monitores', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'nome', mon.nome_completo,
            'telefone', mon.telefone
          ) ORDER BY mon.nome_completo)
          FROM (
            SELECT DISTINCT u.id, u.nome_completo, u.telefone
            FROM public.modalidade_representantes mr
            JOIN public.usuarios u ON u.id = mr.atleta_id
            WHERE mr.modalidade_id = m.id
          ) mon
        ), '[]'::jsonb)
      ) ORDER BY m.nome)
      FROM public.modalidades m
      WHERE m.evento_id = e.id
        AND m.status IN ('Ativa', 'Esgotada')
    ), '[]'::jsonb)
  )
  FROM public.eventos e
  WHERE e.pagina_publica_ativa = true
    AND e.pagina_publica_slug = lower(trim(p_slug));
$$;

REVOKE ALL ON FUNCTION public.get_pagina_publica_evento(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_pagina_publica_evento(text) TO anon, authenticated;

-- Recarrega o cache de schema do PostgREST para a RPC/colunas novas aparecerem.
NOTIFY pgrst, 'reload schema';
