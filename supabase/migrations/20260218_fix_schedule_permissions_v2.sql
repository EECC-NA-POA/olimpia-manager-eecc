-- FIX: PERMISSÕES DO CRONOGRAMA
-- O problema: a view usa tabelas que bloqueiam usuários autenticados
-- A solução: liberar SELECT nas tabelas e criar função RPC como backup

BEGIN;

-- 1. Liberar TODAS as tabelas que a view usa
GRANT SELECT ON public.cronograma_atividades TO authenticated;
GRANT SELECT ON public.cronograma_atividade_modalidades TO authenticated;
GRANT SELECT ON public.modalidades TO authenticated;
GRANT SELECT ON public.inscricoes_modalidades TO authenticated;

-- 2. Liberar a view em si
GRANT SELECT ON public.vw_cronograma_atividades_por_atleta TO authenticated;

-- 3. Garantir RLS com política aberta nas tabelas de cronograma
-- cronograma_atividades
DROP POLICY IF EXISTS "ALL Read Cronograma" ON public.cronograma_atividades;
CREATE POLICY "ALL Read Cronograma"
ON public.cronograma_atividades FOR SELECT
TO authenticated
USING (true);

-- cronograma_atividade_modalidades (se tiver RLS)
DO $$ BEGIN
  IF EXISTS (
    SELECT FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'cronograma_atividade_modalidades' AND n.nspname = 'public'
  ) THEN
    ALTER TABLE public.cronograma_atividade_modalidades ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "ALL Read CAM" ON public.cronograma_atividade_modalidades;
    CREATE POLICY "ALL Read CAM"
      ON public.cronograma_atividade_modalidades FOR SELECT
      TO authenticated USING (true);
  END IF;
END $$;

-- modalidades (se tiver RLS)
DO $$ BEGIN
  IF EXISTS (
    SELECT FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'modalidades' AND n.nspname = 'public'
  ) THEN
    ALTER TABLE public.modalidades ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "ALL Read Modalidades" ON public.modalidades;
    CREATE POLICY "ALL Read Modalidades"
      ON public.modalidades FOR SELECT
      TO authenticated USING (true);
  END IF;
END $$;

-- inscricoes_modalidades
DO $$ BEGIN
  IF EXISTS (
    SELECT FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'inscricoes_modalidades' AND n.nspname = 'public'
  ) THEN
    ALTER TABLE public.inscricoes_modalidades ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "ALL Read Inscricoes Modalidades" ON public.inscricoes_modalidades;
    CREATE POLICY "ALL Read Inscricoes Modalidades"
      ON public.inscricoes_modalidades FOR SELECT
      TO authenticated USING (true);
  END IF;
END $$;

COMMIT;

-- 4. CRIAR FUNÇÃO RPC DE BACKUP (Security Definer - bypassa RLS totalmente)
CREATE OR REPLACE FUNCTION public.get_schedule(p_evento_id uuid, p_atleta_id uuid)
RETURNS TABLE (
  cronograma_atividade_id integer,
  atividade text,
  horario_inicio time,
  horario_fim time,
  dia date,
  local text,
  global boolean,
  evento_id uuid,
  modalidade_nome text,
  modalidade_status character varying,
  atleta_id uuid
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT DISTINCT
    ca.id::integer as cronograma_atividade_id,
    ca.atividade,
    ca.horario_inicio,
    ca.horario_fim,
    ca.dia,
    ca.local,
    ca.global,
    ca.evento_id,
    m.nome as modalidade_nome,
    im.status::character varying as modalidade_status,
    im.atleta_id
  FROM cronograma_atividades ca
  LEFT JOIN cronograma_atividade_modalidades cam ON ca.id = cam.cronograma_atividade_id
  LEFT JOIN modalidades m ON cam.modalidade_id = m.id
  LEFT JOIN inscricoes_modalidades im 
    ON m.id = im.modalidade_id 
    AND ca.evento_id = im.evento_id
    AND im.atleta_id = p_atleta_id
  WHERE ca.evento_id = p_evento_id
    AND (ca.global = true OR im.atleta_id = p_atleta_id);
$$;

GRANT EXECUTE ON FUNCTION public.get_schedule(uuid, uuid) TO authenticated;

SELECT 'Permissões e função RPC criadas com sucesso!' as status;
