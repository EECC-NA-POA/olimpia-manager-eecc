-- DIAGNÓSTICO: CONTEÚDO DA TABELA FILIAIS
-- Objetivo: Ver se existem Paises cadastrados na tabela filiais.

SELECT 
    count(*) as total_registros,
    count(case when pais is not null then 1 end) as com_pais,
    count(case when pais is null then 1 end) as sem_pais
FROM public.filiais;

-- Amostra de dados
SELECT id, nome, cidade, estado, pais 
FROM public.filiais 
LIMIT 10;
