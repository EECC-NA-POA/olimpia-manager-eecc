-- DIAGNÓSTICO DIRETO: CRONOGRAMA DE ATIVIDADES
-- Substitua o UUID de exemplo pelo ID do evento atual do usuário logado

-- 1. Total de atividades no banco (sem filtro de evento)
SELECT count(*) as total_atividades FROM public.cronograma_atividades;

-- 2. Ver todos os evento_ids que têm atividades
SELECT evento_id, count(*) as total
FROM public.cronograma_atividades
GROUP BY evento_id;

-- 3. Primeiras 5 atividades (qualquer evento)
SELECT id, atividade, dia, global, evento_id 
FROM public.cronograma_atividades 
LIMIT 5;

-- 4. Testar a view diretamente (sem filtro de evento)
SELECT count(*) as total_na_view FROM public.vw_cronograma_atividades_por_atleta;

-- 5. Ver primeiras 3 linhas da view
SELECT * FROM public.vw_cronograma_atividades_por_atleta LIMIT 3;
