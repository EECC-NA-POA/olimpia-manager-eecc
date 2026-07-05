-- ============================================================================
-- CRITICO C2: auto-atribuicao de papel privilegiado.
--
-- Antes: assign_user_profiles / swap_user_profile (SECURITY DEFINER, GRANT
-- authenticated) so bloqueavam o perfil de nome 'Administração'. Um atleta podia
-- se auto-conceder ORG/ORE/RDD/JUZ/MST/FMON chamando a RPC direto.
--
-- Agora: no auto-servico (auth.uid() = p_user_id) so passam perfis NAO
-- privilegiados (ATL/PGR). Qualquer perfil cujo codigo esteja em
-- (ADM,ORG,ORE,RDD,JUZ,MST,FMON) exige que o CHAMADOR seja admin (ADM/MST) —
-- checado por CODIGO, nao por nome. Toda alteracao gera trilha.
--
-- EXECUTAR MANUALMENTE no SQL Editor de sb.nova-acropole.org.br.
-- ============================================================================

-- Trilha de auditoria de papeis (SELECT restrito a admin — nao USING(true))
CREATE TABLE IF NOT EXISTS public.papeis_audit_log (
  id           bigserial PRIMARY KEY,
  operation    text        NOT NULL CHECK (operation IN ('ASSIGN', 'SWAP')),
  usuario_alvo uuid,
  evento_id    uuid,
  detalhe      jsonb,
  user_id      uuid        REFERENCES public.usuarios(id),
  "timestamp"  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.papeis_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS papeis_audit_select ON public.papeis_audit_log;
CREATE POLICY papeis_audit_select ON public.papeis_audit_log
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.papeis_usuarios pu
      JOIN public.perfis p ON p.id = pu.perfil_id
      JOIN public.perfis_tipo pt ON pt.id = p.perfil_tipo_id
    WHERE pu.usuario_id = auth.uid()
      AND pt.codigo IN ('ADM', 'ORG', 'ORE', 'MST')
  ));

GRANT SELECT ON public.papeis_audit_log TO authenticated;

-- ---------------------------------------------------------------------------
-- swap_user_profile
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.swap_user_profile(
  p_user_id uuid,
  p_event_id uuid,
  p_new_profile_id integer,
  p_old_profile_id integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid            uuid := auth.uid();
  caller_is_admin  boolean;
  new_is_privileged boolean;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Chamador e admin (ADM/MST) neste evento, ou master global?
  SELECT
    EXISTS (
      SELECT 1 FROM public.papeis_usuarios pu
        JOIN public.perfis p ON p.id = pu.perfil_id
        JOIN public.perfis_tipo pt ON pt.id = p.perfil_tipo_id
      WHERE pu.usuario_id = v_uid AND pu.evento_id = p_event_id
        AND pt.codigo IN ('ADM', 'MST')
    ) OR EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = v_uid AND u.is_master = true)
  INTO caller_is_admin;

  IF NOT (v_uid = p_user_id OR caller_is_admin) THEN
    RAISE EXCEPTION 'Acesso negado: sem permissão para modificar este perfil';
  END IF;

  -- O novo perfil e privilegiado?
  SELECT EXISTS (
    SELECT 1 FROM public.perfis p
      JOIN public.perfis_tipo pt ON pt.id = p.perfil_tipo_id
    WHERE p.id = p_new_profile_id
      AND pt.codigo IN ('ADM', 'ORG', 'ORE', 'RDD', 'JUZ', 'MST', 'FMON')
  ) INTO new_is_privileged;

  IF new_is_privileged AND NOT caller_is_admin THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem atribuir perfis privilegiados';
  END IF;

  UPDATE public.papeis_usuarios
  SET perfil_id = p_new_profile_id
  WHERE usuario_id = p_user_id
    AND evento_id = p_event_id
    AND perfil_id = p_old_profile_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Perfil não encontrado ou não pode ser modificado';
  END IF;

  INSERT INTO public.papeis_audit_log (operation, usuario_alvo, evento_id, detalhe, user_id)
  VALUES ('SWAP', p_user_id, p_event_id,
          jsonb_build_object('old', p_old_profile_id, 'new', p_new_profile_id), v_uid);
END;
$$;

-- ---------------------------------------------------------------------------
-- assign_user_profiles
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.assign_user_profiles(
  p_user_id uuid,
  p_profile_ids integer[],
  p_event_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid           uuid := auth.uid();
  caller_is_admin boolean;
  any_privileged  boolean;
  profile_id      integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  SELECT
    EXISTS (
      SELECT 1 FROM public.papeis_usuarios pu
        JOIN public.perfis p ON p.id = pu.perfil_id
        JOIN public.perfis_tipo pt ON pt.id = p.perfil_tipo_id
      WHERE pu.usuario_id = v_uid AND pu.evento_id = p_event_id
        AND pt.codigo IN ('ADM', 'MST')
    ) OR EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = v_uid AND u.is_master = true)
  INTO caller_is_admin;

  IF NOT (v_uid = p_user_id OR caller_is_admin) THEN
    RAISE EXCEPTION 'Acesso negado: sem permissão para modificar este perfil';
  END IF;

  -- Algum dos perfis pedidos e privilegiado?
  SELECT EXISTS (
    SELECT 1 FROM public.perfis p
      JOIN public.perfis_tipo pt ON pt.id = p.perfil_tipo_id
    WHERE p.id = ANY(p_profile_ids)
      AND pt.codigo IN ('ADM', 'ORG', 'ORE', 'RDD', 'JUZ', 'MST', 'FMON')
  ) INTO any_privileged;

  IF any_privileged AND NOT caller_is_admin THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem atribuir perfis privilegiados';
  END IF;

  DELETE FROM public.papeis_usuarios
  WHERE usuario_id = p_user_id AND evento_id = p_event_id;

  FOREACH profile_id IN ARRAY p_profile_ids
  LOOP
    INSERT INTO public.papeis_usuarios (usuario_id, evento_id, perfil_id)
    VALUES (p_user_id, p_event_id, profile_id);
  END LOOP;

  INSERT INTO public.papeis_audit_log (operation, usuario_alvo, evento_id, detalhe, user_id)
  VALUES ('ASSIGN', p_user_id, p_event_id, to_jsonb(p_profile_ids), v_uid);
END;
$$;

GRANT EXECUTE ON FUNCTION public.swap_user_profile(uuid, uuid, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_user_profiles(uuid, integer[], uuid) TO authenticated;
