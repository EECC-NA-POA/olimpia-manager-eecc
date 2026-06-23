-- CORREÇÃO: Políticas de INSERT/UPDATE/DELETE para a tabela filiais
--
-- Problema: as migrações anteriores (fix_filiais_permissions, force_open_filiais)
-- criaram apenas a política de SELECT (leitura pública para anon/authenticated).
-- Com RLS ativo e sem política de INSERT, toda tentativa de criar uma nova
-- filial era bloqueada pelo PostgreSQL com erro de RLS.
--
-- Solução: adicionar políticas para operações de escrita, permitindo apenas
-- usuários com cadastra_eventos = true (admins/mestres que gerenciam eventos).

BEGIN;

-- Remover políticas de escrita antigas se existirem
DROP POLICY IF EXISTS "Admins can insert filiais" ON public.filiais;
DROP POLICY IF EXISTS "Admins can update filiais" ON public.filiais;
DROP POLICY IF EXISTS "Admins can delete filiais" ON public.filiais;
DROP POLICY IF EXISTS "filiais_insert_admins" ON public.filiais;
DROP POLICY IF EXISTS "filiais_update_admins" ON public.filiais;
DROP POLICY IF EXISTS "filiais_delete_admins" ON public.filiais;

-- Política de INSERT: apenas usuários com cadastra_eventos = true
CREATE POLICY "filiais_insert_admins"
ON public.filiais
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.id = auth.uid()
    AND u.cadastra_eventos = true
  )
);

-- Política de UPDATE: apenas usuários com cadastra_eventos = true
CREATE POLICY "filiais_update_admins"
ON public.filiais
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.id = auth.uid()
    AND u.cadastra_eventos = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.id = auth.uid()
    AND u.cadastra_eventos = true
  )
);

-- Política de DELETE: apenas usuários com cadastra_eventos = true
CREATE POLICY "filiais_delete_admins"
ON public.filiais
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.id = auth.uid()
    AND u.cadastra_eventos = true
  )
);

-- Garantir GRANTs de escrita para authenticated (além do SELECT já concedido)
GRANT INSERT, UPDATE, DELETE ON public.filiais TO authenticated;

COMMIT;

SELECT 'Políticas de INSERT/UPDATE/DELETE para filiais configuradas com sucesso.' AS status;

-- Verificar políticas ativas
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'filiais' AND schemaname = 'public'
ORDER BY cmd;
