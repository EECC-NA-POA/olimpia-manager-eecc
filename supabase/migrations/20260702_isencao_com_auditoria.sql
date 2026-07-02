-- Isenção de atletas por ADM/ORG/RDD, com justificativa obrigatória e auditoria.
--
-- Antes: isenção era UPDATE direto do front em pagamentos, gated só por
-- isCurrentUser (atleta zerava o próprio pagamento, sem registro).
-- Agora: RPC SECURITY DEFINER valida o papel do chamador (auth.uid()),
-- registra quem concedeu + justificativa, e grava no audit log.
--
-- EXECUTAR MANUALMENTE no SQL Editor de sb.nova-acropole.org.br.

-- 1. Colunas de estado da isenção em pagamentos
ALTER TABLE public.pagamentos
  ADD COLUMN IF NOT EXISTS isento_justificativa text,
  ADD COLUMN IF NOT EXISTS isento_por uuid REFERENCES public.usuarios(id),
  ADD COLUMN IF NOT EXISTS isento_em timestamptz;

-- 2. Tabela de auditoria (espelha chamadas_audit_log)
CREATE TABLE IF NOT EXISTS public.pagamentos_audit_log (
  id            bigserial PRIMARY KEY,
  operation     text        NOT NULL CHECK (operation IN ('ISENTAR', 'REMOVER_ISENCAO')),
  atleta_id     uuid,
  evento_id     uuid,
  old_data      jsonb,
  new_data      jsonb,
  justificativa text,
  user_id       uuid        REFERENCES public.usuarios(id),
  "timestamp"   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pagamentos_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pagamentos_audit_select ON public.pagamentos_audit_log;
CREATE POLICY pagamentos_audit_select ON public.pagamentos_audit_log
  FOR SELECT TO authenticated USING (true);

GRANT SELECT ON public.pagamentos_audit_log TO authenticated;

-- 3. RPC que centraliza a concessão/remoção de isenção
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

  -- Papéis do chamador no evento
  SELECT
    bool_or(pt.codigo IN ('ADM', 'ORG', 'ORE')),
    bool_or(pt.codigo = 'RDD')
  INTO v_is_admin_org, v_is_rdd
  FROM public.papeis_usuarios pu
    JOIN public.perfis p ON p.id = pu.perfil_id
    JOIN public.perfis_tipo pt ON pt.id = p.perfil_tipo_id
  WHERE pu.usuario_id = v_uid
    AND pu.evento_id = p_evento_id;

  -- Autorização
  IF COALESCE(v_is_admin_org, false) THEN
    NULL; -- ADM/ORG: qualquer atleta do evento
  ELSIF COALESCE(v_is_rdd, false) THEN
    SELECT filial_id INTO v_atleta_filial FROM public.usuarios WHERE id = p_atleta_id;
    IF v_atleta_filial IS NULL
       OR v_atleta_filial <> ALL (public.get_user_delegacao_filiais(v_uid, p_evento_id)) THEN
      RAISE EXCEPTION 'Sem permissão: atleta fora da sua delegação';
    END IF;
  ELSE
    RAISE EXCEPTION 'Sem permissão para conceder isenção';
  END IF;

  -- Pagamento alvo
  SELECT * INTO v_pag FROM public.pagamentos
   WHERE atleta_id = p_atleta_id AND evento_id = p_evento_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registro de pagamento não encontrado para este atleta/evento';
  END IF;

  v_old := to_jsonb(v_pag);

  IF p_isento THEN
    IF p_justificativa IS NULL OR btrim(p_justificativa) = '' THEN
      RAISE EXCEPTION 'Justificativa obrigatória para isentar';
    END IF;
    UPDATE public.pagamentos
    SET isento = true,
        status = 'isento',
        valor = 0,
        isento_justificativa = p_justificativa,
        isento_por = v_uid,
        isento_em = now()
    WHERE id = v_pag.id;
  ELSE
    SELECT valor INTO v_taxa_valor FROM public.taxas_inscricao WHERE id = v_pag.taxa_inscricao_id;
    UPDATE public.pagamentos
    SET isento = false,
        status = 'pendente',
        valor = COALESCE(v_taxa_valor, v_pag.valor),
        isento_justificativa = NULL,
        isento_por = NULL,
        isento_em = NULL
    WHERE id = v_pag.id;
  END IF;

  -- Auditoria
  INSERT INTO public.pagamentos_audit_log
    (operation, atleta_id, evento_id, old_data, new_data, justificativa, user_id)
  SELECT
    CASE WHEN p_isento THEN 'ISENTAR' ELSE 'REMOVER_ISENCAO' END,
    p_atleta_id, p_evento_id, v_old, to_jsonb(np), p_justificativa, v_uid
  FROM public.pagamentos np WHERE np.id = v_pag.id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.conceder_isencao(uuid, uuid, boolean, text) TO authenticated;
