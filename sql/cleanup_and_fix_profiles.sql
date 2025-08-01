-- =====================================================
-- SQL CLEANUP AND FIX FOR PROFILE SYSTEM
-- This script ensures only the correct versions of functions exist
-- =====================================================

-- 1. Drop any existing conflicting functions
DROP FUNCTION IF EXISTS get_user_profile_safe(uuid);
DROP FUNCTION IF EXISTS get_users_with_auth_status(text, text);

-- 2. Create the updated get_user_profile_safe function with master field
CREATE OR REPLACE FUNCTION get_user_profile_safe(p_user_id uuid)
RETURNS TABLE (
    id uuid,
    nome_completo text,
    telefone text,
    email text,
    numero_identificador text,
    tipo_documento text,
    numero_documento text,
    genero text,
    filial_nome text,
    filial_cidade text,
    filial_estado text,
    pagamento_status text,
    pagamento_valor numeric,
    papeis jsonb,
    data_nascimento date,
    master boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.nome_completo,
        u.telefone,
        u.email,
        u.numero_identificador,
        u.tipo_documento,
        u.numero_documento,
        u.genero,
        f.nome as filial_nome,
        f.cidade as filial_cidade,
        f.estado as filial_estado,
        p.status as pagamento_status,
        p.valor as pagamento_valor,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', perfis.id,
                        'nome', perfis.nome,
                        'codigo', pt.codigo
                    )
                )
                FROM usuario_perfil up
                JOIN perfis ON perfis.id = up.perfil_id
                LEFT JOIN perfis_tipo pt ON pt.id = perfis.tipo_id
                WHERE up.usuario_id = u.id
                AND up.evento_id = (SELECT id FROM eventos WHERE status_evento = 'ativo' LIMIT 1)
            ),
            '[]'::jsonb
        ) as papeis,
        u.data_nascimento,
        COALESCE(u.master, false) as master
    FROM usuarios u
    LEFT JOIN filiais f ON f.id = u.filial_id
    LEFT JOIN pagamentos p ON p.usuario_id = u.id 
        AND p.evento_id = (SELECT id FROM eventos WHERE status_evento = 'ativo' LIMIT 1)
    WHERE u.id = p_user_id;
END;
$$;

-- 3. Create the updated get_users_with_auth_status function with master support
CREATE OR REPLACE FUNCTION get_users_with_auth_status(
    p_search_term text DEFAULT '',
    p_status_filter text DEFAULT 'all',
    p_is_master boolean DEFAULT false
)
RETURNS TABLE (
    id uuid,
    nome_completo text,
    email text,
    numero_documento text,
    tipo_documento text,
    filial_id uuid,
    created_at timestamp with time zone,
    filial_nome text,
    profiles jsonb,
    pagamentos jsonb,
    status_pagamento text,
    auth_status text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.nome_completo,
        u.email,
        u.numero_documento,
        u.tipo_documento,
        u.filial_id,
        u.created_at,
        f.nome as filial_nome,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'perfil_id', up.perfil_id,
                        'perfil_nome', p.nome
                    )
                )
                FROM usuario_perfil up
                JOIN perfis p ON p.id = up.perfil_id
                WHERE up.usuario_id = u.id
                AND up.evento_id = (SELECT id FROM eventos WHERE status_evento = 'ativo' LIMIT 1)
            ),
            '[]'::jsonb
        ) as profiles,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'status', pag.status,
                        'valor', pag.valor,
                        'created_at', pag.created_at
                    )
                )
                FROM pagamentos pag
                WHERE pag.usuario_id = u.id
                AND pag.evento_id = (SELECT id FROM eventos WHERE status_evento = 'ativo' LIMIT 1)
            ),
            '[]'::jsonb
        ) as pagamentos,
        COALESCE(
            (
                SELECT pag.status
                FROM pagamentos pag
                WHERE pag.usuario_id = u.id
                AND pag.evento_id = (SELECT id FROM eventos WHERE status_evento = 'ativo' LIMIT 1)
                ORDER BY pag.created_at DESC
                LIMIT 1
            ),
            'pendente'
        ) as status_pagamento,
        CASE 
            WHEN au.id IS NOT NULL THEN 'confirmed'
            ELSE 'pending'
        END as auth_status
    FROM usuarios u
    LEFT JOIN filiais f ON f.id = u.filial_id
    LEFT JOIN auth.users au ON au.id = u.id
    WHERE 
        (p_is_master = true OR u.filial_id = (
            SELECT filial_id FROM usuarios WHERE id = auth.uid()
        ))
        AND (
            p_search_term = '' OR
            u.nome_completo ILIKE '%' || p_search_term || '%' OR
            u.email ILIKE '%' || p_search_term || '%' OR
            u.numero_documento ILIKE '%' || p_search_term || '%'
        )
        AND (
            p_status_filter = 'all' OR
            (p_status_filter = 'confirmed' AND au.id IS NOT NULL) OR
            (p_status_filter = 'pending' AND au.id IS NULL)
        )
    ORDER BY u.nome_completo;
END;
$$;

-- 4. Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_profile_safe(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_with_auth_status(text, text, boolean) TO authenticated;

-- 5. Create index for master users if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_usuarios_master 
ON public.usuarios (master) 
WHERE master = true;

-- 6. Ensure RLS policies allow profile access
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON usuarios;
CREATE POLICY "Users can read own profile" ON usuarios
    FOR SELECT USING (auth.uid() = id);

-- Policy for master users to read all profiles
DROP POLICY IF EXISTS "Master users can read all profiles" ON usuarios;
CREATE POLICY "Master users can read all profiles" ON usuarios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND master = true
        )
    );

-- 7. Fix the view_perfil_atleta view to include master field
DROP VIEW IF EXISTS view_perfil_atleta;
CREATE VIEW view_perfil_atleta AS
SELECT 
    u.id,
    u.nome_completo,
    u.telefone,
    u.email,
    u.numero_identificador,
    u.tipo_documento,
    u.numero_documento,
    u.genero,
    u.data_nascimento,
    f.nome as filial_nome,
    f.cidade as filial_cidade,
    f.estado as filial_estado,
    p.status as pagamento_status,
    p.valor as pagamento_valor,
    COALESCE(u.master, false) as master,
    COALESCE(
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', perfis.id,
                    'nome', perfis.nome,
                    'codigo', pt.codigo
                )
            )
            FROM usuario_perfil up
            JOIN perfis ON perfis.id = up.perfil_id
            LEFT JOIN perfis_tipo pt ON pt.id = perfis.tipo_id
            WHERE up.usuario_id = u.id
        ),
        '[]'::jsonb
    ) as papeis
FROM usuarios u
LEFT JOIN filiais f ON f.id = u.filial_id
LEFT JOIN pagamentos p ON p.usuario_id = u.id;

-- Grant permissions on the view
GRANT SELECT ON view_perfil_atleta TO authenticated;

-- 8. Create a simple test function to verify everything works
CREATE OR REPLACE FUNCTION test_profile_system(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    SELECT row_to_json(t) INTO result
    FROM (
        SELECT * FROM get_user_profile_safe(p_user_id)
    ) t;
    
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION test_profile_system(uuid) TO authenticated;