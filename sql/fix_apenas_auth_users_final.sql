-- ===============================
-- SCRIPT FINAL PARA CORRIGIR USUÁRIOS "APENAS AUTH"
-- Execute este script no Supabase SQL Editor
-- ===============================

-- PASSO 1: Remover todas as versões da função existente
DROP FUNCTION IF EXISTS get_users_with_auth_status(UUID);
DROP FUNCTION IF EXISTS get_users_with_auth_status(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS get_users_with_auth_status(p_filial_id UUID);
DROP FUNCTION IF EXISTS get_users_with_auth_status(p_filial_id UUID, p_is_master BOOLEAN);

-- PASSO 2: Criar função corrigida que inclui usuários "Apenas Auth" SEM dados de filial
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
    filial_sigla TEXT,
    filial_estado TEXT,
    has_auth BOOLEAN,
    tipo_cadastro TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    
    -- UNIÃO de usuários completos + usuários apenas auth
    SELECT * FROM (
        
        -- 1. USUÁRIOS COMPLETOS (existem tanto em usuarios quanto em auth.users)
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
            f.sigla as filial_sigla,
            f.estado as filial_estado,
            CASE 
                WHEN au.id IS NOT NULL THEN true 
                ELSE false 
            END as has_auth,
            CASE 
                WHEN au.id IS NOT NULL THEN 'Completo'::text
                ELSE 'Apenas Usuário'::text
            END as tipo_cadastro
        FROM public.usuarios u
        LEFT JOIN public.filiais f ON u.filial_id = f.id
        LEFT JOIN auth.users au ON u.id = au.id
        WHERE 
            u.ativo = true
            AND (
                -- Se for master, mostrar TODOS os usuários completos
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
        
        UNION ALL
        
        -- 2. USUÁRIOS "APENAS AUTH" (existem apenas em auth.users, não em usuarios)
        -- ⚠️ IMPORTANTE: Estes usuários NÃO terão dados de filial (NULL)
        SELECT 
            au.id,
            au.email,
            COALESCE(au.raw_user_meta_data->>'nome_completo', 'Nome não informado') as nome_completo,
            COALESCE(au.raw_user_meta_data->>'telefone', '') as telefone,
            COALESCE(au.raw_user_meta_data->>'documento_numero', '') as documento_numero,
            COALESCE(au.raw_user_meta_data->>'tipo_documento', 'CPF') as tipo_documento,
            COALESCE(au.raw_user_meta_data->>'genero', 'Não informado') as genero,
            CASE 
                WHEN au.raw_user_meta_data->>'data_nascimento' IS NOT NULL 
                THEN (au.raw_user_meta_data->>'data_nascimento')::date 
                ELSE NULL 
            END as data_nascimento,
            true as ativo, -- usuários auth sempre ativos
            au.email_confirmed_at IS NOT NULL as confirmado,
            au.created_at::timestamp without time zone as data_criacao,
            -- ✅ CORREÇÃO: Para usuários "Apenas Auth", NÃO mostrar dados de filial
            NULL::uuid as filial_id,
            NULL::text as filial_nome,
            NULL::text as filial_sigla,
            NULL::text as filial_estado,
            true as has_auth, -- sempre tem auth
            'Apenas Auth'::text as tipo_cadastro
        FROM auth.users au
        LEFT JOIN public.usuarios u ON au.id = u.id
        WHERE 
            -- Só usuários que NÃO existem na tabela usuarios
            u.id IS NULL
            -- Apenas para usuários master (usuários normais não veem "Apenas Auth")
            AND get_users_with_auth_status.p_is_master = true
    
    ) combined_users
    ORDER BY combined_users.nome_completo;
    
END;
$$;

-- PASSO 3: Conceder permissões
GRANT EXECUTE ON FUNCTION get_users_with_auth_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_with_auth_status TO anon;

-- PASSO 4: Testar função para usuário master (deve incluir "Apenas Auth" SEM filial)
SELECT 'Teste 1: Usuários Master (completos + apenas auth):' as teste;
SELECT 
    nome_completo,
    email,
    tipo_cadastro,
    filial_nome,
    CASE 
        WHEN filial_nome IS NULL THEN '✅ SEM FILIAL (correto para Apenas Auth)'
        ELSE '❌ COM FILIAL (incorreto para Apenas Auth se tipo = "Apenas Auth")'
    END as status_filial
FROM get_users_with_auth_status(NULL, true) 
WHERE tipo_cadastro = 'Apenas Auth'
LIMIT 5;

-- PASSO 5: Testar contagem total
SELECT 'Teste 2: Contagem por tipo de cadastro:' as teste;
SELECT 
    tipo_cadastro,
    COUNT(*) as total,
    COUNT(filial_nome) as com_filial,
    COUNT(*) - COUNT(filial_nome) as sem_filial
FROM get_users_with_auth_status(NULL, true)
GROUP BY tipo_cadastro
ORDER BY tipo_cadastro;

-- PASSO 6: Verificar se a função foi criada
SELECT 
    'Função corrigida com sucesso!' as status,
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'get_users_with_auth_status';

SELECT '🎉 CORREÇÃO APLICADA! Usuários "Apenas Auth" agora aparecem SEM dados de filial.' as resultado;