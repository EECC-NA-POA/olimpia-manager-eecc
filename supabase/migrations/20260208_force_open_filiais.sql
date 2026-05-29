-- SOLUÇÃO RLS: FORÇAR ABERTURA DA TABELA FILIAIS
-- Objetivo: Remover TODAS as políticas antigas e criar uma única permissiva.

BEGIN;

-- 1. Logar o que existe (para debug)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'filiais' 
        AND schemaname = 'public'
    LOOP
        RAISE NOTICE 'Apagando política antiga: %', pol.policyname;
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.filiais';
    END LOOP;
END $$;

-- 2. Garantir RLS
ALTER TABLE public.filiais ENABLE ROW LEVEL SECURITY;

-- 3. Criar a ÚNICA política necessária
CREATE POLICY "Public Read Filiais"
ON public.filiais FOR SELECT
TO anon, authenticated
USING (true);

-- 4. Garantir Grants
GRANT SELECT ON public.filiais TO anon, authenticated;

COMMIT;

SELECT 'Políticas de segurança da tabela Filiais foram resetadas com sucesso.' as status;
