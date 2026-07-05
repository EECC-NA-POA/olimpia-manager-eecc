-- ============================================================================
-- ACHADO MAIS CRITICO da auditoria: RLS de papeis_usuarios e pagamentos
-- estava efetivamente ABERTA, contornando TODAS as RPCs seguras ja escritas.
--
-- (A) papeis_usuarios: policies "minimal_papeis_policy" (ALL, public,
--     qual=true) e "Allow insert during registration" (INSERT, public,
--     with_check=true) liberavam INSERT/UPDATE/DELETE sem NENHUMA restricao,
--     para o role `public` (que inclui `anon`) — combinado com GRANT INSERT
--     para anon, um usuario NEM PRECISAVA ESTAR LOGADO para se auto-conceder
--     qualquer perfil (ADM/ORG/etc) em qualquer evento. As outras duas
--     policies ("papeis_usuarios_final_policy"/"..._no_recursion_policy")
--     tambem eram insuficientes: permitiam auto-insert de QUALQUER perfil_id
--     (sem distinguir privilegiado de nao-privilegiado).
--
-- (B) pagamentos: "Users can update their own payments" permitia
--     self-UPDATE irrestrito (qualquer coluna, incl. status/valor/isento).
--     "Delegation representatives can manage their branch payments" tinha
--     uma junção sem correlacionar `pu.usuario_id` ao chamador nem
--     `pu.evento_id` ao evento do pagamento — na pratica, QUALQUER usuario
--     autenticado tinha controle total sobre o pagamento de QUALQUER atleta
--     da mesma filial (incluindo o proprio).
--
-- EXECUTAR MANUALMENTE no SQL Editor de sb.nova-acropole.org.br. URGENTE.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- (A) papeis_usuarios
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS minimal_papeis_policy ON public.papeis_usuarios;
DROP POLICY IF EXISTS papeis_usuarios_final_policy ON public.papeis_usuarios;
DROP POLICY IF EXISTS papeis_usuarios_no_recursion_policy ON public.papeis_usuarios;
DROP POLICY IF EXISTS "Allow insert during registration" ON public.papeis_usuarios;

-- INSERT: admin (is_user_admin) pode atribuir qualquer perfil a qualquer
-- usuario; auto-servico so para perfis NAO privilegiados (fluxo normal de
-- inscricao: ATL/PGR/dependentes); auto-servico de perfil PRIVILEGIADO so
-- no bootstrap (evento sem NENHUM papel privilegiado atribuido ainda —
-- caso do criador do evento se tornando ADM pela primeira vez).
CREATE POLICY papeis_usuarios_insert_policy ON public.papeis_usuarios
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_user_admin(auth.uid(), evento_id)
    OR (
      usuario_id = auth.uid()
      AND (
        EXISTS (
          SELECT 1 FROM public.perfis p
            JOIN public.perfis_tipo pt ON pt.id = p.perfil_tipo_id
          WHERE p.id = papeis_usuarios.perfil_id
            AND pt.codigo NOT IN ('ADM','ORG','ORE','RDD','JUZ','MST','FMON')
        )
        OR (
          EXISTS (
            SELECT 1 FROM public.perfis p
              JOIN public.perfis_tipo pt ON pt.id = p.perfil_tipo_id
            WHERE p.id = papeis_usuarios.perfil_id
              AND pt.codigo IN ('ADM','ORG','ORE','RDD','JUZ','MST','FMON')
          )
          AND NOT EXISTS (
            SELECT 1 FROM public.papeis_usuarios pu2
              JOIN public.perfis p2 ON p2.id = pu2.perfil_id
              JOIN public.perfis_tipo pt2 ON pt2.id = p2.perfil_tipo_id
            WHERE pu2.evento_id = papeis_usuarios.evento_id
              AND pt2.codigo IN ('ADM','ORG','ORE','RDD','JUZ','MST','FMON')
          )
        )
      )
    )
  );

-- UPDATE/DELETE: so administradores do evento (nenhum fluxo legitimo do app
-- faz update/delete direto em papeis_usuarios — mudanca de papel passa
-- pelas RPCs assign_user_profiles/swap_user_profile, ja corrigidas).
CREATE POLICY papeis_usuarios_update_admin_only ON public.papeis_usuarios
  FOR UPDATE TO authenticated
  USING (public.is_user_admin(auth.uid(), evento_id))
  WITH CHECK (public.is_user_admin(auth.uid(), evento_id));

CREATE POLICY papeis_usuarios_delete_admin_only ON public.papeis_usuarios
  FOR DELETE TO authenticated
  USING (public.is_user_admin(auth.uid(), evento_id));

-- Defesa em profundidade: anon nao deveria ter grant nenhum nesta tabela.
REVOKE ALL PRIVILEGES ON public.papeis_usuarios FROM anon;

-- ----------------------------------------------------------------------------
-- (B) pagamentos
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can update their own payments" ON public.pagamentos;
DROP POLICY IF EXISTS "Delegation representatives can manage their branch payments" ON public.pagamentos;

-- Self-update restrito: so permite reenviar comprovante (reseta para
-- 'pendente'), nunca se auto-confirmar nem se auto-isentar. Preserva o
-- fluxo legitimo de submitEventPayment (src/services/paymentService.ts).
CREATE POLICY pagamentos_self_update_comprovante ON public.pagamentos
  FOR UPDATE TO authenticated
  USING (atleta_id = auth.uid())
  WITH CHECK (
    atleta_id = auth.uid()
    AND status = 'pendente'
    AND isento = false
  );

-- RDD: corrigido para correlacionar o CHAMADOR (pu.usuario_id = auth.uid())
-- e o EVENTO do pagamento (pu.evento_id = pagamentos.evento_id) — a versao
-- anterior nao filtrava pu pelo chamador nem pelo evento.
CREATE POLICY "Delegation representatives can manage their branch payments" ON public.pagamentos
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.papeis_usuarios pu
        JOIN public.perfis p ON p.id = pu.perfil_id
        JOIN public.usuarios u ON u.id = auth.uid()
        JOIN public.usuarios atleta ON atleta.id = pagamentos.atleta_id
      WHERE p.nome = 'Representante de Delegação'
        AND pu.usuario_id = auth.uid()
        AND pu.evento_id = pagamentos.evento_id
        AND atleta.filial_id = u.filial_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.papeis_usuarios pu
        JOIN public.perfis p ON p.id = pu.perfil_id
        JOIN public.usuarios u ON u.id = auth.uid()
        JOIN public.usuarios atleta ON atleta.id = pagamentos.atleta_id
      WHERE p.nome = 'Representante de Delegação'
        AND pu.usuario_id = auth.uid()
        AND pu.evento_id = pagamentos.evento_id
        AND atleta.filial_id = u.filial_id
    )
  );

-- Defesa em profundidade: anon nao deveria ter grant nenhum nesta tabela.
REVOKE ALL PRIVILEGES ON public.pagamentos FROM anon;

-- ----------------------------------------------------------------------------
-- (C) inscricoes_eventos: so defesa em profundidade (grants de anon).
--     Policies de INSERT/SELECT ja corretas (correlacionam evento_id no
--     caminho admin; self-insert restrito a usuario_id=auth.uid()).
-- ----------------------------------------------------------------------------
REVOKE ALL PRIVILEGES ON public.inscricoes_eventos FROM anon;
