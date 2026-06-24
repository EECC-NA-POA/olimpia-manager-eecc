-- Permite INSERT/UPDATE/DELETE em chamada_presencas para Organizadores e Admins.
-- Necessário para que Organizadores possam editar presenças de chamadas passadas.
-- Monitores já possuem sua policy própria de escrita.
--
-- PRÉ-REQUISITO: rodar antes o diagnóstico abaixo e confirmar que os nomes
-- de colunas do join perfis→perfis_tipo estão corretos:
--
--   SELECT pu.usuario_id, pt.codigo
--   FROM papeis_usuarios pu
--   JOIN perfis p ON pu.perfil_id = p.id
--   JOIN perfis_tipo pt ON p.perfil_tipo_id = pt.id
--   LIMIT 1;
--
-- Se a coluna se chamar diferente de "perfil_tipo_id" ou "codigo", ajuste abaixo.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chamada_presencas'
      AND policyname = 'chamada_presencas_write_admins'
  ) THEN
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
      )
    );
  END IF;
END$$;

GRANT INSERT, UPDATE, DELETE ON public.chamada_presencas TO authenticated;
