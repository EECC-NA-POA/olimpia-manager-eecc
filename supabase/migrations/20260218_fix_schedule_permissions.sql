-- PERMISSÕES PARA CRONOGRAMA
-- Garante que usuários autenticados conseguem ler o cronograma.

BEGIN;

-- 1. Tabela principal cronograma_atividades
ALTER TABLE IF EXISTS public.cronograma_atividades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated Read Cronograma" ON public.cronograma_atividades;
CREATE POLICY "Authenticated Read Cronograma"
ON public.cronograma_atividades FOR SELECT
TO authenticated
USING (true);

GRANT SELECT ON public.cronograma_atividades TO authenticated;

-- 2. Tabela inscricoes_eventos (necessária para buscar eventos inscritos no dashboard)
ALTER TABLE IF EXISTS public.inscricoes_eventos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users Read Own Enrollments" ON public.inscricoes_eventos;
CREATE POLICY "Users Read Own Enrollments"
ON public.inscricoes_eventos FOR SELECT
TO authenticated
USING (usuario_id = auth.uid());

GRANT SELECT ON public.inscricoes_eventos TO authenticated;

COMMIT;

-- Verificar se a view existe
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('cronograma_atividades', 'vw_cronograma_atividades_por_atleta', 'inscricoes_eventos', 'eventos_filiais');
