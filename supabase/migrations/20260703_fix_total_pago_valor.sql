-- ============================================================================
-- Corrige "Total Pago errado" (ex.: R$320 em vez de R$480 no evento 1a9e71ee).
--
-- Raiz: pagamentos.valor funciona como taxa devida, mas conceder_isencao ZERAVA
-- o valor ao isentar e atualizar_status_pagamento (botao "Confirmar") NUNCA
-- restaurava. Ex-isentos confirmados terminavam com valor=0 e a view somava 0.
--
-- Solucao (4 camadas): restaura dados; isencao deixa de zerar; confirmacao
-- blinda o valor; view defensiva. Idempotente.
-- Pre-requisito: constraint UNIQUE(atleta_id, evento_id) (20260703_pagamentos_unico_por_evento) ja aplicada.
--
-- EXECUTAR MANUALMENTE no SQL Editor de sb.nova-acropole.org.br (via VPN).
-- Ordem: 1) dados  2) RPC isencao  3) RPC status  4) view.
-- ============================================================================

-- 1) RESTAURO DE DADOS: valor = taxa para linhas 0/null.
--    Preserva override manual (>0) e taxa gratuita (taxa.valor > 0).
UPDATE public.pagamentos p
SET valor = t.valor
FROM public.taxas_inscricao t
WHERE t.id = p.taxa_inscricao_id
  AND (p.valor IS NULL OR p.valor = 0)
  AND COALESCE(t.valor, 0) > 0
  AND p.status <> 'isento';

-- 2) conceder_isencao: PARA de zerar valor (isento = status + flag; valor fica = taxa).
CREATE OR REPLACE FUNCTION public.conceder_isencao(
  p_atleta_id     uuid,
  p_evento_id     uuid,
  p_isento        boolean,
  p_justificativa text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid           uuid := auth.uid();
  v_is_admin_org  boolean;
  v_is_rdd        boolean;
  v_atleta_filial uuid;
  v_pag           public.pagamentos%ROWTYPE;
  v_taxa_valor    numeric;
  v_old           jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  SELECT
    bool_or(pt.codigo IN ('ADM', 'ORG', 'ORE')),
    bool_or(pt.codigo = 'RDD')
  INTO v_is_admin_org, v_is_rdd
  FROM public.papeis_usuarios pu
    JOIN public.perfis p ON p.id = pu.perfil_id
    JOIN public.perfis_tipo pt ON pt.id = p.perfil_tipo_id
  WHERE pu.usuario_id = v_uid
    AND pu.evento_id = p_evento_id;

  IF COALESCE(v_is_admin_org, false) THEN
    NULL;
  ELSIF COALESCE(v_is_rdd, false) THEN
    SELECT filial_id INTO v_atleta_filial FROM public.usuarios WHERE id = p_atleta_id;
    IF v_atleta_filial IS NULL
       OR v_atleta_filial <> ALL (public.get_user_delegacao_filiais(v_uid, p_evento_id)) THEN
      RAISE EXCEPTION 'Sem permissão: atleta fora da sua delegação';
    END IF;
  ELSE
    RAISE EXCEPTION 'Sem permissão para conceder isenção';
  END IF;

  SELECT * INTO v_pag FROM public.pagamentos
   WHERE atleta_id = p_atleta_id AND evento_id = p_evento_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registro de pagamento não encontrado para este atleta/evento';
  END IF;

  v_old := to_jsonb(v_pag);
  SELECT valor INTO v_taxa_valor FROM public.taxas_inscricao WHERE id = v_pag.taxa_inscricao_id;

  IF p_isento THEN
    IF p_justificativa IS NULL OR btrim(p_justificativa) = '' THEN
      RAISE EXCEPTION 'Justificativa obrigatória para isentar';
    END IF;
    -- NAO zera valor: mantem a taxa (ou override), para o dia em que a isencao for removida
    UPDATE public.pagamentos
    SET isento = true,
        status = 'isento',
        valor  = COALESCE(NULLIF(v_pag.valor, 0), v_taxa_valor, v_pag.valor),
        isento_justificativa = p_justificativa,
        isento_por = v_uid,
        isento_em = now()
    WHERE id = v_pag.id;
  ELSE
    UPDATE public.pagamentos
    SET isento = false,
        status = 'pendente',
        valor  = COALESCE(NULLIF(v_taxa_valor, 0), NULLIF(v_pag.valor, 0), v_taxa_valor, v_pag.valor),
        isento_justificativa = NULL,
        isento_por = NULL,
        isento_em = NULL
    WHERE id = v_pag.id;
  END IF;

  INSERT INTO public.pagamentos_audit_log
    (operation, atleta_id, evento_id, old_data, new_data, justificativa, user_id)
  SELECT
    CASE WHEN p_isento THEN 'ISENTAR' ELSE 'REMOVER_ISENCAO' END,
    p_atleta_id, p_evento_id, v_old, to_jsonb(np), p_justificativa, v_uid
  FROM public.pagamentos np WHERE np.id = v_pag.id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.conceder_isencao(uuid, uuid, boolean, text) TO authenticated;

-- 3) atualizar_status_pagamento: blinda a confirmacao (restaura valor da taxa se 0/null).
CREATE OR REPLACE FUNCTION public.atualizar_status_pagamento(
  p_atleta_id uuid,
  p_novo_status text,
  p_evento_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.pagamentos p
  SET
    status = p_novo_status,
    data_validacao = CASE WHEN p_novo_status = 'confirmado' THEN NOW() ELSE NULL END,
    valor = CASE
      WHEN p_novo_status = 'confirmado' AND (p.valor IS NULL OR p.valor = 0)
        THEN COALESCE(
               NULLIF((SELECT t.valor FROM public.taxas_inscricao t WHERE t.id = p.taxa_inscricao_id), 0),
               p.valor
             )
      ELSE p.valor
    END
  WHERE p.atleta_id = p_atleta_id
    AND p.evento_id = p_evento_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.atualizar_status_pagamento(uuid, text, uuid) TO authenticated;

-- 4) View defensiva: valor_total_pago E valor_total_pendente usam COALESCE(NULLIF(valor,0), taxa).
--    Restante identico a 20260702_modalidades_por_status_inscricao.sql; muda so:
--    registration_data ganha LEFT JOIN taxas_inscricao (taxa_valor) e os dois somatorios.
CREATE OR REPLACE VIEW public.vw_analytics_inscricoes AS
WITH all_events AS (
         SELECT eventos.id AS evento_id FROM eventos
        ), all_branches AS (
         SELECT filiais.id AS filial_id, filiais.nome AS filial FROM filiais
        ), event_branch_combinations AS (
         SELECT ae.evento_id, ab.filial_id, ab.filial
           FROM all_events ae CROSS JOIN all_branches ab
        ), registration_data AS (
         SELECT u.filial_id, f.nome AS filial, p.evento_id, p.atleta_id,
            p.status AS status_pagamento, p.valor, t.valor AS taxa_valor
           FROM pagamentos p
             JOIN usuarios u ON p.atleta_id = u.id
             JOIN filiais f ON u.filial_id = f.id
             LEFT JOIN taxas_inscricao t ON t.id = p.taxa_inscricao_id
          WHERE p.status = ANY (ARRAY['confirmado'::text, 'pendente'::text, 'cancelado'::text, 'isento'::text])
        ), modality_data AS (
         SELECT u.filial_id, f.nome AS filial, im.evento_id, im.atleta_id,
            im.modalidade_id, m.nome AS modalidade_nome, im.status AS status_inscricao
           FROM inscricoes_modalidades im
             JOIN usuarios u ON im.atleta_id = u.id
             JOIN filiais f ON u.filial_id = f.id
             LEFT JOIN modalidades m ON m.id = im.modalidade_id
        ), branch_payment_status AS (
         SELECT ebc_1.evento_id, ebc_1.filial_id, ebc_1.filial,
            COALESCE(rd.status_pagamento, 'pendente'::text) AS status_pagamento,
            count(DISTINCT rd.atleta_id) AS quantidade
           FROM event_branch_combinations ebc_1
             LEFT JOIN registration_data rd ON ebc_1.evento_id = rd.evento_id AND ebc_1.filial_id = rd.filial_id
          GROUP BY ebc_1.evento_id, ebc_1.filial_id, ebc_1.filial, (COALESCE(rd.status_pagamento, 'pendente'::text))
        ), branch_modality_counts AS (
         SELECT ebc_1.evento_id, ebc_1.filial_id, ebc_1.filial, md.modalidade_nome,
            COALESCE(md.status_inscricao, 'pendente'::text) AS status_inscricao,
            count(DISTINCT md.atleta_id) AS total_inscritos
           FROM event_branch_combinations ebc_1
             LEFT JOIN modality_data md ON ebc_1.evento_id = md.evento_id AND ebc_1.filial_id = md.filial_id
          WHERE md.modalidade_nome IS NOT NULL
          GROUP BY ebc_1.evento_id, ebc_1.filial_id, ebc_1.filial, md.modalidade_nome, (COALESCE(md.status_inscricao, 'pendente'::text))
        ), branch_rankings AS (
         SELECT rf.evento_id, rf.filial_id, COALESCE(rf.total_pontos, 0::numeric) AS total_pontos
           FROM ranking_filiais rf
        )
 SELECT ebc.filial_id, ebc.filial, ebc.evento_id,
    COALESCE(( SELECT sum(bps.quantidade) AS sum
           FROM branch_payment_status bps
          WHERE bps.filial_id = ebc.filial_id AND bps.evento_id = ebc.evento_id AND (bps.status_pagamento = ANY (ARRAY['confirmado'::text, 'pendente'::text, 'cancelado'::text, 'isento'::text]))), 0::numeric) AS total_inscritos_geral,
    COALESCE(( SELECT count(*) AS count
           FROM modality_data md
          WHERE md.filial_id = ebc.filial_id AND md.evento_id = ebc.evento_id), 0::bigint) AS total_inscritos_modalidades,
    COALESCE(( SELECT sum(COALESCE(NULLIF(rd.valor, 0::numeric), rd.taxa_valor, 0::numeric)) AS sum
           FROM registration_data rd
          WHERE rd.filial_id = ebc.filial_id AND rd.evento_id = ebc.evento_id AND rd.status_pagamento = 'confirmado'::text), 0::numeric) AS valor_total_pago,
    COALESCE(( SELECT sum(COALESCE(NULLIF(rd.valor, 0::numeric), rd.taxa_valor, 0::numeric)) AS sum
           FROM registration_data rd
          WHERE rd.filial_id = ebc.filial_id AND rd.evento_id = ebc.evento_id AND rd.status_pagamento = 'pendente'::text), 0::numeric) AS valor_total_pendente,
    COALESCE(( SELECT jsonb_agg(jsonb_build_object('modalidade', bmc.modalidade_nome, 'status_inscricao', bmc.status_inscricao, 'total_inscritos', bmc.total_inscritos, 'filial', bmc.filial)) AS jsonb_agg
           FROM branch_modality_counts bmc
          WHERE bmc.evento_id = ebc.evento_id AND bmc.modalidade_nome IS NOT NULL), '[]'::jsonb) AS modalidades_populares,
    COALESCE(( SELECT jsonb_agg(jsonb_build_object('status_pagamento', bps.status_pagamento, 'quantidade', bps.quantidade)) AS jsonb_agg
           FROM branch_payment_status bps
          WHERE bps.filial_id = ebc.filial_id AND bps.evento_id = ebc.evento_id), '[]'::jsonb) AS inscritos_por_status_pagamento,
    COALESCE(( SELECT jsonb_agg(jsonb_build_object('status_pagamento', bps.status_pagamento, 'quantidade', bps.quantidade)) AS jsonb_agg
           FROM branch_payment_status bps
          WHERE bps.filial_id = ebc.filial_id AND bps.evento_id = ebc.evento_id), '[]'::jsonb) AS total_inscritos_por_status,
    COALESCE(( SELECT jsonb_agg(jsonb_build_object('total_pontos', COALESCE(br.total_pontos, 0::numeric))) AS jsonb_agg
           FROM branch_rankings br
          WHERE br.filial_id = ebc.filial_id AND br.evento_id = ebc.evento_id), '[{"total_pontos": 0}]'::jsonb) AS ranking_filiais,
    COALESCE(( SELECT jsonb_agg(jsonb_build_object('filial_nome', bps.filial, 'status_pagamento', bps.status_pagamento, 'quantidade', bps.quantidade)) AS jsonb_agg
           FROM branch_payment_status bps
          WHERE bps.evento_id = ebc.evento_id), '[]'::jsonb) AS registros_por_filial,
    '[]'::jsonb AS atletas_por_categoria,
    '[]'::jsonb AS media_pontuacao_por_modalidade
   FROM event_branch_combinations ebc
  GROUP BY ebc.filial_id, ebc.filial, ebc.evento_id;

-- 5) Conferencia (evento 1a9e71ee): esperado 12 confirmado / soma 480.
SELECT status, count(*) AS qtd, sum(valor) AS soma_valor
FROM public.pagamentos
WHERE evento_id = '1a9e71ee-5127-4d65-a83e-2f058446286b'
GROUP BY status
ORDER BY status;
