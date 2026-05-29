-- DIAGNÓSTICO: CRONOGRAMA
-- Execute e cole os resultados

-- 1. Estrutura de cronograma_atividades
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'cronograma_atividades'
ORDER BY ordinal_position;

-- 2. Quantos registros existem e para quais eventos?
SELECT evento_id, count(*) as total
FROM public.cronograma_atividades
GROUP BY evento_id
ORDER BY total DESC
LIMIT 10;

-- 3. Definição da view
SELECT pg_get_viewdef('public.vw_cronograma_atividades_por_atleta'::regclass, true) as view_definition;

-- 4. Políticas RLS ativas na tabela cronograma_atividades
SELECT policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'cronograma_atividades' AND schemaname = 'public';

-- 5. RLS ativo ou não?
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'cronograma_atividades' AND relnamespace = 'public'::regnamespace;
