-- CORREÇÃO DE PERMISSÕES PARA TABELA FILIAIS
-- O App não consegue carregar "País" se o usuário não estiver logado (anon).
-- Este script libera a leitura pública da tabela filiais.

BEGIN;

-- 1. Garantir RLS ativado (Segurança)
ALTER TABLE public.filiais ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas que possam estar bloqueando ou duplicadas
DROP POLICY IF EXISTS "Public Access Filiais" ON public.filiais;
DROP POLICY IF EXISTS "Filiais are viewable by everyone" ON public.filiais;
DROP POLICY IF EXISTS "Ler filiais" ON public.filiais;

-- 3. Criar política de Leitura Pública (Anon + Authenticated)
CREATE POLICY "Public Access Filiais" 
ON public.filiais FOR SELECT 
TO anon, authenticated 
USING (true);

-- 4. Garantir permissões de GRANT (as vezes o RLS deixa, mas o GRANT barra)
GRANT SELECT ON public.filiais TO anon, authenticated;

COMMIT;

-- 5. Diagnóstico: Verificar se tem dados
SELECT count(*) as total_filiais, count(DISTINCT pais) as total_paises 
FROM public.filiais;
