-- ========== UPDATE FUNCTIONS TO SUPPORT MASTER USER SYSTEM ==========

-- 1. Update get_user_profile_safe to include master field
CREATE OR REPLACE FUNCTION get_user_profile_safe(p_user_id uuid, p_event_id uuid)
RETURNS TABLE(
    nome_completo text,
    telefone text,
    filial_id text,
    confirmado boolean,
    master boolean,
    papeis jsonb
) 
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
                FROM public.papeis_usuarios pu
                JOIN public.perfis p ON pu.perfil_id = p.id
                JOIN public.perfis_tipo pt ON p.perfil_tipo_id = pt.id
                WHERE pu.usuario_id = p_user_id
                AND pu.evento_id = p_event_id
            ),
            '[]'::jsonb
        ) as papeis
    FROM public.usuarios u
    LEFT JOIN auth.users au ON u.email = au.email
    WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_profile_safe(uuid, uuid) TO authenticated;

-- 2. Update get_users_with_auth_status to support master users
CREATE OR REPLACE FUNCTION get_users_with_auth_status(p_filial_id UUID DEFAULT NULL, p_is_master BOOLEAN DEFAULT FALSE)
RETURNS TABLE (
    id TEXT,
    nome_completo TEXT,
    email TEXT,
    telefone TEXT,
    numero_documento TEXT,
    tipo_documento TEXT,
    genero TEXT,
    data_nascimento TEXT,
    filial_nome TEXT,
    filial_cidade TEXT,
    filial_estado TEXT,
    confirmado BOOLEAN,
    auth_id TEXT,
    auth_email TEXT,
    auth_email_confirmed_at TIMESTAMPTZ,
    auth_created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id::TEXT,
        u.nome_completo,
        u.email,
        u.telefone,
        u.numero_documento,
        u.tipo_documento,
        u.genero,
        u.data_nascimento,
        f.nome as filial_nome,
        f.cidade as filial_cidade,
        f.estado as filial_estado,
        u.confirmado,
        au.id::TEXT as auth_id,
        au.email as auth_email,
        au.email_confirmed_at as auth_email_confirmed_at,
        au.created_at as auth_created_at
    FROM public.usuarios u
    LEFT JOIN public.filiais f ON u.filial_id::UUID = f.id
    LEFT JOIN auth.users au ON u.email = au.email
    WHERE (
        -- If master user, show all users regardless of branch
        (p_is_master = TRUE) OR
        -- If not master, filter by branch as usual
        (p_is_master = FALSE AND (
            p_filial_id IS NULL OR 
            u.filial_id::UUID = p_filial_id
        ))
    )
    -- Additional validation for auth.users filial_id when not master
    AND (
        p_is_master = TRUE OR
        au.id IS NULL OR
        au.raw_user_meta_data->>'filial_id' IS NULL OR
        au.raw_user_meta_data->>'filial_id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    )
    AND (
        p_is_master = TRUE OR
        p_filial_id IS NULL OR
        au.id IS NULL OR
        au.raw_user_meta_data->>'filial_id' IS NULL OR
        (au.raw_user_meta_data->>'filial_id')::UUID = p_filial_id
    )
    
    ORDER BY nome_completo;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission for the updated function
GRANT EXECUTE ON FUNCTION get_users_with_auth_status(uuid, boolean) TO authenticated;

-- Create index for performance optimization on master column
CREATE INDEX IF NOT EXISTS idx_usuarios_master ON public.usuarios(master) WHERE master = true;