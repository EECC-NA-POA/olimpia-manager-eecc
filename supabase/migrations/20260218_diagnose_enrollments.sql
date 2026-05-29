-- DIAGNÓSTICO COMPLETO: INSCRIÇÕES E EVENTOS
-- Execute e cole os resultados

-- 1. Estrutura da tabela inscricoes_eventos
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'inscricoes_eventos'
ORDER BY ordinal_position;

-- 2. Amostra das 5 primeiras inscrições (para ver IDs e formato)
SELECT * FROM public.inscricoes_eventos LIMIT 5;

-- 3. Políticas RLS ativas
SELECT policyname, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'inscricoes_eventos' AND schemaname = 'public';
