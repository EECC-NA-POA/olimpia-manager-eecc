-- Corrige contagens de "Inscrições por Modalidade" na vw_analytics_inscricoes.
--
-- Dois ajustes no CTE modality_data (restante da view permanece idêntico):
--   1. Filtra im.status = 'confirmado' — antes contava inscrições pendentes/
--      canceladas/rejeitadas, divergindo da lista "Confirmadas" do dashboard.
--   2. Move o filtro p.status do WHERE para o ON do LEFT JOIN pagamentos —
--      o WHERE sobre coluna do LEFT JOIN virava INNER JOIN e excluía atletas
--      sem linha de pagamento; agora contam com status 'pendente' (COALESCE).
--
-- EXECUTAR MANUALMENTE no SQL Editor de sb.nova-acropole.org.br.

CREATE OR REPLACE VIEW public.vw_analytics_inscricoes AS
WITH all_events AS (
         SELECT eventos.id AS evento_id
           FROM eventos
        ), all_branches AS (
         SELECT filiais.id AS filial_id,
            filiais.nome AS filial
           FROM filiais
        ), event_branch_combinations AS (
         SELECT ae.evento_id,
            ab.filial_id,
            ab.filial
           FROM all_events ae
             CROSS JOIN all_branches ab
        ), registration_data AS (
         SELECT u.filial_id,
            f.nome AS filial,
            p.evento_id,
            p.atleta_id,
            p.status AS status_pagamento,
            p.valor
           FROM pagamentos p
             JOIN usuarios u ON p.atleta_id = u.id
             JOIN filiais f ON u.filial_id = f.id
          WHERE p.status = ANY (ARRAY['confirmado'::text, 'pendente'::text, 'cancelado'::text, 'isento'::text])
        ), modality_data AS (
         SELECT u.filial_id,
            f.nome AS filial,
            im.evento_id,
            im.atleta_id,
            im.modalidade_id,
            m.nome AS modalidade_nome,
            p.status AS status_pagamento
           FROM inscricoes_modalidades im
             JOIN usuarios u ON im.atleta_id = u.id
             JOIN filiais f ON u.filial_id = f.id
             LEFT JOIN modalidades m ON m.id = im.modalidade_id
             LEFT JOIN pagamentos p ON u.id = p.atleta_id AND im.evento_id = p.evento_id
                  AND p.status = ANY (ARRAY['confirmado'::text, 'pendente'::text, 'cancelado'::text, 'isento'::text])
          WHERE im.status = 'confirmado'::text
        ), branch_payment_status AS (
         SELECT ebc_1.evento_id,
            ebc_1.filial_id,
            ebc_1.filial,
            COALESCE(rd.status_pagamento, 'pendente'::text) AS status_pagamento,
            count(DISTINCT rd.atleta_id) AS quantidade
           FROM event_branch_combinations ebc_1
             LEFT JOIN registration_data rd ON ebc_1.evento_id = rd.evento_id AND ebc_1.filial_id = rd.filial_id
          GROUP BY ebc_1.evento_id, ebc_1.filial_id, ebc_1.filial, (COALESCE(rd.status_pagamento, 'pendente'::text))
        ), branch_modality_counts AS (
         SELECT ebc_1.evento_id,
            ebc_1.filial_id,
            ebc_1.filial,
            md.modalidade_nome,
            COALESCE(md.status_pagamento, 'pendente'::text) AS status_pagamento,
            count(DISTINCT md.atleta_id) AS total_inscritos
           FROM event_branch_combinations ebc_1
             LEFT JOIN modality_data md ON ebc_1.evento_id = md.evento_id AND ebc_1.filial_id = md.filial_id
          WHERE md.modalidade_nome IS NOT NULL
          GROUP BY ebc_1.evento_id, ebc_1.filial_id, ebc_1.filial, md.modalidade_nome, (COALESCE(md.status_pagamento, 'pendente'::text))
        ), branch_rankings AS (
         SELECT rf.evento_id,
            rf.filial_id,
            COALESCE(rf.total_pontos, 0::numeric) AS total_pontos
           FROM ranking_filiais rf
        )
 SELECT ebc.filial_id,
    ebc.filial,
    ebc.evento_id,
    COALESCE(( SELECT sum(bps.quantidade) AS sum
           FROM branch_payment_status bps
          WHERE bps.filial_id = ebc.filial_id AND bps.evento_id = ebc.evento_id AND (bps.status_pagamento = ANY (ARRAY['confirmado'::text, 'pendente'::text, 'cancelado'::text, 'isento'::text]))), 0::numeric) AS total_inscritos_geral,
    COALESCE(( SELECT count(*) AS count
           FROM modality_data md
          WHERE md.filial_id = ebc.filial_id AND md.evento_id = ebc.evento_id), 0::bigint) AS total_inscritos_modalidades,
    COALESCE(( SELECT sum(rd.valor) AS sum
           FROM registration_data rd
          WHERE rd.filial_id = ebc.filial_id AND rd.evento_id = ebc.evento_id AND rd.status_pagamento = 'confirmado'::text), 0::numeric) AS valor_total_pago,
    COALESCE(( SELECT sum(rd.valor) AS sum
           FROM registration_data rd
          WHERE rd.filial_id = ebc.filial_id AND rd.evento_id = ebc.evento_id AND rd.status_pagamento = 'pendente'::text), 0::numeric) AS valor_total_pendente,
    COALESCE(( SELECT jsonb_agg(jsonb_build_object('modalidade', bmc.modalidade_nome, 'status_pagamento', bmc.status_pagamento, 'total_inscritos', bmc.total_inscritos, 'filial', bmc.filial)) AS jsonb_agg
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
