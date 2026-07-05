-- ============================================================================
-- Onda 2 da auditoria de seguranca: updatePaymentAmount escrevia direto em
-- pagamentos (supabase.from('pagamentos').update({valor})), sem RPC, dependendo
-- so de uma policy de RLS de UPDATE que nao esta versionada no repositorio.
--
-- Agora: nova RPC atualizar_valor_pagamento, SECURITY DEFINER, mesmo padrao de
-- autorizacao de conceder_isencao/atualizar_status_pagamento (ADM/ORG/ORE ou
-- RDD por filial da delegacao), valida valor >= 0 e grava trilha em
-- pagamentos_audit_log.
--
-- EXECUTAR MANUALMENTE no SQL Editor de sb.nova-acropole.org.br.
-- ============================================================================

-- Permitir a operacao 'VALOR' na trilha de auditoria de pagamentos
ALTER TABLE public.pagamentos_audit_log DROP CONSTRAINT IF EXISTS pagamentos_audit_log_operation_check;
ALTER TABLE public.pagamentos_audit_log ADD CONSTRAINT pagamentos_audit_log_operation_check
  CHECK (operation IN ('ISENTAR', 'REMOVER_ISENCAO', 'STATUS', 'VALOR'));

CREATE OR REPLACE FUNCTION public.atualizar_valor_pagamento(
  p_atleta_id uuid,
  p_novo_valor numeric,
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

  IF p_novo_valor IS NULL OR p_novo_valor < 0 THEN
    RAISE EXCEPTION 'Valor inválido: %', p_novo_valor;
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
    NULL; -- ADM/ORG: qualquer atleta do evento
  ELSIF COALESCE(v_is_rdd, false) THEN
    SELECT filial_id INTO v_atleta_filial FROM public.usuarios WHERE id = p_atleta_id;
    IF v_atleta_filial IS NULL
       OR v_atleta_filial <> ALL (public.get_user_delegacao_filiais(v_uid, p_evento_id)) THEN
      RAISE EXCEPTION 'Sem permissão: atleta fora da sua delegação';
    END IF;
  ELSE
    RAISE EXCEPTION 'Sem permissão para alterar valor de pagamento';
  END IF;

  SELECT * INTO v_pag FROM public.pagamentos
   WHERE atleta_id = p_atleta_id AND evento_id = p_evento_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registro de pagamento não encontrado para este atleta/evento';
  END IF;
  v_old := to_jsonb(v_pag);

  UPDATE public.pagamentos
  SET valor = p_novo_valor
  WHERE id = v_pag.id;

  INSERT INTO public.pagamentos_audit_log
    (operation, atleta_id, evento_id, old_data, new_data, justificativa, user_id)
  SELECT 'VALOR', p_atleta_id, p_evento_id, v_old, to_jsonb(np), p_novo_valor::text, v_uid
  FROM public.pagamentos np WHERE np.id = v_pag.id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.atualizar_valor_pagamento(uuid, numeric, uuid) TO authenticated;
