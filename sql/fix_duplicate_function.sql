-- ===============================
-- SCRIPT PARA CORRIGIR FUNÇÃO DUPLICADA get_users_with_auth_status
-- Execute este script no Supabase SQL Editor
-- ===============================

-- PASSO 1: Identificar todas as versões da função
SELECT 
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments,
    prosrc as function_body
FROM pg_proc 
WHERE proname = 'get_users_with_auth_status';

-- PASSO 2: Remover TODAS as versões existentes da função
DROP FUNCTION IF EXISTS get_users_with_auth_status(UUID);
DROP FUNCTION IF EXISTS get_users_with_auth_status(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS get_users_with_auth_status(p_filial_id UUID);
DROP FUNCTION IF EXISTS get_users_with_auth_status(p_filial_id UUID, p_is_master BOOLEAN);

-- Confirmar que todas as versões foram removidas
SELECT COUNT(*) as functions_remaining 
FROM pg_proc 
WHERE proname = 'get_users_with_auth_status';

-- PASSO 3: Criar uma única versão limpa da função
CREATE OR REPLACE FUNCTION get_users_with_auth_status(
    p_filial_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    email TEXT,
    nome_completo TEXT,
    telefone TEXT,
    documento_numero TEXT,
    ativo BOOLEAN,
    data_criacao TIMESTAMPTZ,
    data_atualizacao TIMESTAMPTZ,
    filial_id UUID,
    filial_nome TEXT,
    filial_sigla TEXT,
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
        u.documento_numero,
        u.ativo,
        u.data_criacao,
        u.data_atualizacao,
        u.filial_id,
        f.nome as filial_nome,
        f.sigla as filial_sigla,
        f.estado as filial_estado,
        CASE 
            WHEN au.id IS NOT NULL THEN true 
            ELSE false 
        END as has_auth
    FROM public.usuarios u
    LEFT JOIN public.filiais f ON u.filial_id = f.id
    LEFT JOIN auth.users au ON u.id = au.id
    WHERE (p_filial_id IS NULL OR u.filial_id = p_filial_id)
    ORDER BY u.nome_completo;
END;
$$;

-- PASSO 4: Conceder permissões necessárias
GRANT EXECUTE ON FUNCTION get_users_with_auth_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_with_auth_status TO anon;

-- PASSO 5: Testar a função
-- Teste 1: Chamar sem parâmetros (deve retornar todos os usuários)
SELECT 'Teste 1 - Todos os usuários:' as teste;
SELECT COUNT(*) as total_usuarios FROM get_users_with_auth_status();

-- Teste 2: Chamar com filial_id específico
SELECT 'Teste 2 - Com filial específica:' as teste;
-- Substitua pelo UUID de uma filial válida para testar
-- SELECT * FROM get_users_with_auth_status('SEU_FILIAL_ID_AQUI'::uuid) LIMIT 3;

-- Verificar se a função foi criada corretamente
SELECT 
    'Função recriada com sucesso!' as status,
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'get_users_with_auth_status';

SELECT 'Script executado com sucesso! A função duplicada foi corrigida.' as resultado;