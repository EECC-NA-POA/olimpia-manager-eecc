-- Fix the get_user_profile_safe function
-- Drop existing function if exists
DROP FUNCTION IF EXISTS public.get_user_profile_safe(uuid);
DROP FUNCTION IF EXISTS public.get_user_profile_safe(uuid, uuid);

-- Create the corrected function with single parameter
CREATE OR REPLACE FUNCTION public.get_user_profile_safe(
    p_user_id uuid
)
RETURNS TABLE (
    nome_completo text,
    telefone text,
    filial_id uuid,
    confirmado boolean,
    master boolean,
    papeis jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.nome_completo,
        u.telefone,
        u.filial_id,
        u.confirmado,
        COALESCE(u.master, false) as master,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'nome', pt.nome,
                        'codigo', pt.codigo,
                        'descricao', pt.descricao
                    )
                )
                FROM papeis_usuarios pu
                JOIN perfis p ON p.id = pu.perfil_id
                JOIN perfis_tipo pt ON pt.id = p.perfil_tipo_id
                WHERE pu.usuario_id = p_user_id
                  AND pu.evento_id = (
                      SELECT id FROM eventos 
                      WHERE status_evento = 'ativo' 
                      ORDER BY created_at DESC 
                      LIMIT 1
                  )
            ),
            '[]'::jsonb
        ) as papeis
    FROM usuarios u
    WHERE u.id = p_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_profile_safe(uuid) TO authenticated;

-- Add comment to function
COMMENT ON FUNCTION public.get_user_profile_safe(uuid) IS 'Safely retrieves user profile data with roles for the current active event';