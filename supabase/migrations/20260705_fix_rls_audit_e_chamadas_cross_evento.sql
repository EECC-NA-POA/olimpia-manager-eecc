-- ============================================================================
-- Onda 2 da auditoria de seguranca: fecha 2 padroes de falha em RLS.
--
-- (A) Audit logs abertos: pagamentos_audit_log, chamadas_audit_log e
--     papeis_audit_log tinham SELECT liberado a QUALQUER authenticated
--     (USING(true) ou sem correlacionar o papel do leitor ao evento do
--     registro) — qualquer usuario lia auditoria de pagamentos/isencoes/
--     chamadas/atribuicao de papeis de TODOS os eventos.
--
-- (B) RLS cross-evento em chamadas: as policies de escrita/exclusao de
--     chamadas/chamada_presencas checavam so o CODIGO do papel do usuario
--     (ORG/ADM/MST), sem checar em qual EVENTO ele tem esse papel — um
--     ORG do evento X conseguia escrever/apagar chamadas do evento Y.
--
-- Cadeia de correlacao usada (chamadas nao tem evento_id direto):
--   chamadas.modalidade_rep_id -> modalidade_representantes.modalidade_id
--   -> modalidades.evento_id
--
-- EXECUTAR MANUALMENTE no SQL Editor de sb.nova-acropole.org.br.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) pagamentos_audit_log: ADM/ORG/ORE (qualquer atleta do evento) ou RDD
--    (so atletas cuja filial esteja no escopo da delegacao, no mesmo evento).
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS pagamentos_audit_select ON public.pagamentos_audit_log;
CREATE POLICY pagamentos_audit_select ON public.pagamentos_audit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.papeis_usuarios pu
        JOIN public.perfis p ON p.id = pu.perfil_id
        JOIN public.perfis_tipo pt ON pt.id = p.perfil_tipo_id
      WHERE pu.usuario_id = auth.uid()
        AND pu.evento_id = pagamentos_audit_log.evento_id
        AND pt.codigo IN ('ADM', 'ORG', 'ORE')
    )
    OR (
      EXISTS (
        SELECT 1 FROM public.papeis_usuarios pu
          JOIN public.perfis p ON p.id = pu.perfil_id
          JOIN public.perfis_tipo pt ON pt.id = p.perfil_tipo_id
        WHERE pu.usuario_id = auth.uid()
          AND pu.evento_id = pagamentos_audit_log.evento_id
          AND pt.codigo = 'RDD'
      )
      AND EXISTS (
        SELECT 1 FROM public.usuarios u
        WHERE u.id = pagamentos_audit_log.atleta_id
          AND u.filial_id = ANY (public.get_user_delegacao_filiais(auth.uid(), pagamentos_audit_log.evento_id))
      )
    )
  );

-- ----------------------------------------------------------------------------
-- 2) chamadas_audit_log: ADM/ORG/ORE/MST do evento da chamada.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "chamadas_audit_log_select" ON public.chamadas_audit_log;
CREATE POLICY "chamadas_audit_log_select" ON public.chamadas_audit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.chamadas c
        JOIN public.modalidade_representantes mr ON mr.id = c.modalidade_rep_id
        JOIN public.modalidades m ON m.id = mr.modalidade_id
        JOIN public.papeis_usuarios pu ON pu.evento_id = m.evento_id
        JOIN public.perfis p ON p.id = pu.perfil_id
        JOIN public.perfis_tipo pt ON pt.id = p.perfil_tipo_id
      WHERE c.id = chamadas_audit_log.chamada_id
        AND pu.usuario_id = auth.uid()
        AND pt.codigo IN ('ORG', 'ADM', 'ORE', 'MST')
    )
  );

-- ----------------------------------------------------------------------------
-- 3) papeis_audit_log: faltava correlacionar pu.evento_id ao evento do
--    registro (mesmo defeito, corrigido aqui).
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS papeis_audit_select ON public.papeis_audit_log;
CREATE POLICY papeis_audit_select ON public.papeis_audit_log
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.papeis_usuarios pu
      JOIN public.perfis p ON p.id = pu.perfil_id
      JOIN public.perfis_tipo pt ON pt.id = p.perfil_tipo_id
    WHERE pu.usuario_id = auth.uid()
      AND pu.evento_id = papeis_audit_log.evento_id
      AND pt.codigo IN ('ADM', 'ORG', 'ORE', 'MST')
  ));

-- ----------------------------------------------------------------------------
-- 4) chamada_presencas_write_admins: correlaciona o papel do chamador ao
--    evento da chamada (via chamada_id -> chamadas -> modalidade_representantes
--    -> modalidades.evento_id), tanto no USING quanto no WITH CHECK.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "chamada_presencas_write_admins" ON public.chamada_presencas;
CREATE POLICY "chamada_presencas_write_admins"
ON public.chamada_presencas FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.papeis_usuarios pu
      JOIN public.perfis p ON pu.perfil_id = p.id
      JOIN public.perfis_tipo pt ON p.perfil_tipo_id = pt.id
    WHERE pu.usuario_id = auth.uid()
      AND pt.codigo IN ('ORG', 'ADM', 'MST')
      AND EXISTS (
        SELECT 1
        FROM public.chamadas c
          JOIN public.modalidade_representantes mr ON mr.id = c.modalidade_rep_id
          JOIN public.modalidades m ON m.id = mr.modalidade_id
        WHERE c.id = chamada_presencas.chamada_id
          AND m.evento_id = pu.evento_id
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.papeis_usuarios pu
      JOIN public.perfis p ON pu.perfil_id = p.id
      JOIN public.perfis_tipo pt ON p.perfil_tipo_id = pt.id
    WHERE pu.usuario_id = auth.uid()
      AND pt.codigo IN ('ORG', 'ADM', 'MST')
      AND EXISTS (
        SELECT 1
        FROM public.chamadas c
          JOIN public.modalidade_representantes mr ON mr.id = c.modalidade_rep_id
          JOIN public.modalidades m ON m.id = mr.modalidade_id
        WHERE c.id = chamada_presencas.chamada_id
          AND m.evento_id = pu.evento_id
      )
  )
);

-- ----------------------------------------------------------------------------
-- 5) chamadas_delete_admins: mesma correlacao, direto de
--    chamadas.modalidade_rep_id (sem o hop por chamada_id).
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "chamadas_delete_admins" ON public.chamadas;
CREATE POLICY "chamadas_delete_admins"
  ON public.chamadas FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.papeis_usuarios pu
        JOIN public.perfis p       ON pu.perfil_id      = p.id
        JOIN public.perfis_tipo pt ON p.perfil_tipo_id  = pt.id
      WHERE pu.usuario_id = auth.uid()
        AND pt.codigo IN ('ORG', 'ADM', 'MST')
        AND EXISTS (
          SELECT 1
          FROM public.modalidade_representantes mr
            JOIN public.modalidades m ON m.id = mr.modalidade_id
          WHERE mr.id = chamadas.modalidade_rep_id
            AND m.evento_id = pu.evento_id
        )
    )
  );
