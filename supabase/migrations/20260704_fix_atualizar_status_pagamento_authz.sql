-- ============================================================================
-- CRITICO C1: atualizar_status_pagamento sem checagem de papel.
--
-- Antes: SECURITY DEFINER + GRANT EXECUTE TO authenticated, SEM validar
-- auth.uid()/papel -> qualquer usuario autenticado confirmava/alterava o
-- pagamento de QUALQUER atleta em QUALQUER evento, sem trilha.
--
-- Agora: espelha conceder_isencao (ADM/ORG/ORE, ou RDD por filial da delegacao),
-- restringe p_novo_status a uma allowlist e grava trilha em pagamentos_audit_log.
-- Preserva a logica de restauro de valor (correcao do Total Pago).
--
-- EXECUTAR MANUALMENTE no SQL Editor de sb.nova-acropole.org.br.
-- ============================================================================

-- Permitir a operacao 'STATUS' na trilha de auditoria de pagamentos
ALTER TABLE public.pagamentos_audit_log DROP CONSTRAINT IF EXISTS pagamentos_audit_log_operation_check;
ALTER TABLE public.pagamentos_audit_log ADD CONSTRAINT pagamentos_audit_log_operation_check
  CHECK (operation IN ('ISENTAR', 'REMOVER_ISENCAO', 'STATUS'));

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
DECLARE
  v_uid           uuid := auth.uid();
  v_is_admin_org  boolean;
  v_is_rdd        boolean;
  v_atleta_filial uuid;
  v_pag           public.pagamentos%ROWTYPE;
  v_old           jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Allowlist de status (isencao e feita por conceder_isencao, nao aqui)
  IF p_novo_status NOT IN ('confirmado', 'pendente', 'cancelado') THEN
    RAISE EXCEPTION 'Status inválido: %', p_novo_status;
  END IF;

  -- Papel do chamador no evento
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
    NULL; -- ADM/ORG: qualquer atleta do evento
  ELSIF COALESCE(v_is_rdd, false) THEN
    SELECT filial_id INTO v_atleta_filial FROM public.usuarios WHERE id = p_atleta_id;
    IF v_atleta_filial IS NULL
       OR v_atleta_filial <> ALL (public.get_user_delegacao_filiais(v_uid, p_evento_id)) THEN
      RAISE EXCEPTION 'Sem permissão: atleta fora da sua delegação';
    END IF;
  ELSE
    RAISE EXCEPTION 'Sem permissão para alterar status de pagamento';
  END IF;

  SELECT * INTO v_pag FROM public.pagamentos
   WHERE atleta_id = p_atleta_id AND evento_id = p_evento_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registro de pagamento não encontrado para este atleta/evento';
  END IF;
  v_old := to_jsonb(v_pag);

  UPDATE public.pagamentos p
  SET
    status = p_novo_status,
    data_validacao = CASE WHEN p_novo_status = 'confirmado' THEN NOW() ELSE NULL END,
    -- Rede de seguranca (Total Pago): ao confirmar, se valor 0/null, puxa da taxa
    valor = CASE
      WHEN p_novo_status = 'confirmado' AND (p.valor IS NULL OR p.valor = 0)
        THEN COALESCE(
               NULLIF((SELECT t.valor FROM public.taxas_inscricao t WHERE t.id = p.taxa_inscricao_id), 0),
               p.valor)
      ELSE p.valor
    END
  WHERE p.atleta_id = p_atleta_id AND p.evento_id = p_evento_id;

  INSERT INTO public.pagamentos_audit_log
    (operation, atleta_id, evento_id, old_data, new_data, justificativa, user_id)
  SELECT 'STATUS', p_atleta_id, p_evento_id, v_old, to_jsonb(np), p_novo_status, v_uid
  FROM public.pagamentos np WHERE np.id = v_pag.id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.atualizar_status_pagamento(uuid, text, uuid) TO authenticated;
