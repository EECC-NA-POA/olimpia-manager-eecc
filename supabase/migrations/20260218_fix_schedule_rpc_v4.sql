-- CRITICAL FIX V4: Fix mismatch text[] vs jsonb
-- Explicitly cast dias_semana (which is text[]) to jsonb

CREATE OR REPLACE FUNCTION public.get_schedule(p_evento_id uuid, p_atleta_id uuid)
RETURNS TABLE (
    cronograma_atividade_id integer,
    atividade text,
    horario_inicio time without time zone,
    horario_fim time without time zone,
    dia date,
    local text,
    global boolean,
    evento_id uuid,
    modalidade_nome text,
    modalidade_status text,
    atleta_id uuid,
    recorrente boolean,
    dias_semana jsonb,
    horarios_por_dia jsonb,
    locais_por_dia jsonb,
    data_fim_recorrencia date
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT DISTINCT
    ca.id::integer as cronograma_atividade_id,
    ca.atividade,
    ca.horario_inicio,
    ca.horario_fim,
    ca.dia,
    ca.local,
    ca.global,
    ca.evento_id,
    m.nome as modalidade_nome,
    im.status as modalidade_status,
    im.atleta_id,
    ca.recorrente,
    to_jsonb(ca.dias_semana) as dias_semana,
    ca.horarios_por_dia,
    ca.locais_por_dia,
    ca.data_fim_recorrencia
  FROM cronograma_atividades ca
  LEFT JOIN cronograma_atividade_modalidades cam ON ca.id = cam.cronograma_atividade_id
  LEFT JOIN modalidades m ON cam.modalidade_id = m.id
  LEFT JOIN inscricoes_modalidades im 
    ON m.id = im.modalidade_id 
    AND ca.evento_id = im.evento_id
    AND im.atleta_id = p_atleta_id
  WHERE ca.evento_id = p_evento_id
    AND (ca.global = true OR im.atleta_id = p_atleta_id);
$$;

GRANT EXECUTE ON FUNCTION public.get_schedule(uuid, uuid) TO authenticated;
