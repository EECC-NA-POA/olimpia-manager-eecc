-- RPC CASCADE: FUNÇÕES PARA O FORMULÁRIO DE CADASTRO
-- Garante que o App consiga carregar País -> Estado -> Filial sem travar no RLS.

BEGIN;

-- 1. Buscar Países Únicos
CREATE OR REPLACE FUNCTION public.get_unique_countries()
RETURNS TABLE (pais text)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT DISTINCT f.pais 
  FROM public.filiais f
  WHERE f.pais IS NOT NULL AND f.pais != ''
  ORDER BY f.pais;
$$;

-- 2. Buscar Estados por País
CREATE OR REPLACE FUNCTION public.get_states_by_country(p_pais text)
RETURNS TABLE (estado text)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT DISTINCT f.estado 
  FROM public.filiais f
  WHERE f.pais = p_pais
  ORDER BY f.estado;
$$;

-- 3. Buscar Filiais por Estado (e País opcionalmente, mas estado já filtra bem)
CREATE OR REPLACE FUNCTION public.get_branches_by_state(p_estado text)
RETURNS TABLE (id uuid, nome text, cidade text, estado text)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT f.id, f.nome, f.cidade, f.estado
  FROM public.filiais f
  WHERE f.estado = p_estado
  ORDER BY f.nome;
$$;

-- Liberar acesso público para as funções
GRANT EXECUTE ON FUNCTION public.get_unique_countries() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_states_by_country(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_branches_by_state(text) TO anon, authenticated, service_role;

COMMIT;

SELECT 'Funções RPC de localização criadas com sucesso.' as status;
