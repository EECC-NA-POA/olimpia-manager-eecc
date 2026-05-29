-- FUNÇÃO RPC: BUSCAR PAÍSES (Sem travar no RLS)
-- Objetivo: Criar uma função segura que o App chama direto, ignorando políticas de tabela.

CREATE OR REPLACE FUNCTION public.get_unique_countries()
RETURNS TABLE (pais text)
SECURITY DEFINER -- Roda com permissão de ADMIN
SET search_path = public
LANGUAGE sql
AS $$
  SELECT DISTINCT f.pais 
  FROM public.filiais f
  WHERE f.pais IS NOT NULL AND f.pais != ''
  ORDER BY f.pais;
$$;

-- Liberar para todos (logados ou não)
GRANT EXECUTE ON FUNCTION public.get_unique_countries() TO anon, authenticated, service_role;

-- Diagnóstico
SELECT * FROM public.get_unique_countries();
