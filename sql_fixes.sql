-- SQL script para corrigir o carregamento de perfis de usuários
-- Execute este script no Supabase SQL Editor

-- 1. Verificar dados existentes
SELECT 'Verificando dados das tabelas...' as status;

-- Verificar usuários
SELECT COUNT(*) as total_usuarios FROM usuarios;

-- Verificar perfis
SELECT COUNT(*) as total_perfis FROM perfis;

-- Verificar tipos de perfil
SELECT * FROM perfis_tipo ORDER BY codigo;

-- Verificar papéis de usuários
SELECT COUNT(*) as total_papeis_usuarios FROM papeis_usuarios;

-- 2. Criar ou recriar a função get_user_profile_safe
CREATE OR REPLACE FUNCTION get_user_profile_safe(
    p_user_id UUID,
    p_event_id UUID
)
RETURNS TABLE (
    nome_completo TEXT,
    telefone TEXT,
    filial_id UUID,
    confirmado BOOLEAN,
    papeis JSONB
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.nome_completo,
        u.telefone,
        u.filial_id,
        u.confirmado,
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
                JOIN perfis p ON pu.perfil_id = p.id
                JOIN perfis_tipo pt ON p.perfil_tipo_id = pt.id
                WHERE pu.usuario_id = p_user_id 
                AND pu.evento_id = p_event_id
            ),
            '[]'::jsonb
        ) as papeis
    FROM usuarios u
    WHERE u.id = p_user_id;
END;
$$;

-- 3. Garantir que a função tenha as permissões corretas
GRANT EXECUTE ON FUNCTION get_user_profile_safe TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile_safe TO anon;

-- 4. Verificar se as políticas RLS estão permitindo acesso
-- Desabilitar temporariamente RLS para debugging (reabilitar depois)
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE papeis_usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE perfis DISABLE ROW LEVEL SECURITY;
ALTER TABLE perfis_tipo DISABLE ROW LEVEL SECURITY;

-- 5. Testar a função com um usuário específico (substitua os UUIDs pelos valores reais)
-- SELECT * FROM get_user_profile_safe('seu-user-id'::uuid, 'seu-event-id'::uuid);

-- 6. Query para verificar dados de um usuário específico
-- Substitua os valores pelos IDs reais para testar
/*
SELECT 
    u.id as user_id,
    u.nome_completo,
    pu.evento_id,
    p.nome as perfil_nome,
    pt.codigo,
    pt.nome as tipo_nome
FROM usuarios u
LEFT JOIN papeis_usuarios pu ON u.id = pu.usuario_id
LEFT JOIN perfis p ON pu.perfil_id = p.id
LEFT JOIN perfis_tipo pt ON p.perfil_tipo_id = pt.id
WHERE u.id = 'SEU_USER_ID_AQUI'
AND pu.evento_id = 'SEU_EVENT_ID_AQUI';
*/

-- 7. Reabilitar RLS após os testes (descomentar quando necessário)
/*
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE papeis_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis_tipo ENABLE ROW LEVEL SECURITY;
*/

SELECT 'Script executado com sucesso!' as status;