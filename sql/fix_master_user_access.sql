-- ===============================
-- SCRIPT PARA CORRIGIR ACESSO DE USUÁRIO MASTER
-- Execute este script no Supabase SQL Editor
-- ===============================

-- PASSO 1: Remover todas as versões da função existente
DROP FUNCTION IF EXISTS get_users_with_auth_status(UUID);
DROP FUNCTION IF EXISTS get_users_with_auth_status(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS get_users_with_auth_status(p_filial_id UUID);
DROP FUNCTION IF EXISTS get_users_with_auth_status(p_filial_id UUID, p_is_master BOOLEAN);

-- PASSO 2: Criar função corrigida sem condição conflitante
CREATE OR REPLACE FUNCTION get_users_with_auth_status(
    p_filial_id UUID DEFAULT NULL,
    p_is_master BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    id UUID,
    email TEXT,
    nome_completo TEXT,
    telefone TEXT,
    documento_numero CHARACTER VARYING(11),
    tipo_documento TEXT,
    genero TEXT,
    data_nascimento DATE,
    ativo BOOLEAN,
    confirmado BOOLEAN,
    data_criacao TIMESTAMP WITHOUT TIME ZONE,
    filial_id UUID,
    filial_nome TEXT,
    filial_cidade TEXT,
    filial_estado TEXT,
    has_auth BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.nome_completo,
        u.telefone,
        u.numero_documento,
        u.tipo_documento,
        u.genero,
        u.data_nascimento,
        u.ativo,
        u.confirmado,
        u.data_criacao,
        u.filial_id,
        f.nome as filial_nome,
        f.cidade as filial_cidade,
        f.estado as filial_estado,
        CASE 
            WHEN au.id IS NOT NULL THEN true 
            ELSE false 
        END as has_auth
    FROM public.usuarios u
    LEFT JOIN public.filiais f ON u.filial_id = f.id
    LEFT JOIN auth.users au ON u.id = au.id
    WHERE 
        -- Filtrar apenas usuários ativos
        u.ativo = true
        -- Lógica simplificada para usuário master vs normal
        AND (
            -- Se for master, mostrar TODOS os usuários do sistema
            (get_users_with_auth_status.p_is_master = true) 
            OR 
            -- Se não for master e tiver filial_id específica, mostrar só dessa filial
            (get_users_with_auth_status.p_is_master = false AND get_users_with_auth_status.p_filial_id IS NOT NULL AND u.filial_id = get_users_with_auth_status.p_filial_id)
            OR
            -- Se não for master e não tiver filial_id, mostrar só da filial do usuário logado
            (get_users_with_auth_status.p_is_master = false AND get_users_with_auth_status.p_filial_id IS NULL AND u.filial_id = (
                SELECT u2.filial_id FROM usuarios u2 WHERE u2.id = auth.uid()
            ))
        )
    ORDER BY u.nome_completo;
END;
$$;

-- PASSO 3: Conceder permissões
GRANT EXECUTE ON FUNCTION get_users_with_auth_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_with_auth_status TO anon;

-- PASSO 4: Testar função para usuário master
SELECT 'Teste para usuário MASTER (deve mostrar TODOS os usuários):' as teste;
SELECT COUNT(*) as total_usuarios_master FROM get_users_with_auth_status(NULL, true);

-- PASSO 5: Testar função para usuário normal
SELECT 'Teste para usuário NORMAL (deve mostrar só da filial):' as teste;
SELECT COUNT(*) as total_usuarios_normal FROM get_users_with_auth_status(NULL, false);

-- PASSO 6: Verificar se a função foi criada
SELECT 
    'Função corrigida com sucesso!' as status,
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'get_users_with_auth_status';

SELECT 'Script executado! Usuários master agora podem ver todos os usuários do sistema.' as resultado;