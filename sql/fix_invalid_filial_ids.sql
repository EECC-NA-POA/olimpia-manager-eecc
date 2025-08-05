-- ===============================
-- SCRIPT DE DIAGNÓSTICO E CORREÇÃO DE FILIAL_ID INVÁLIDOS
-- Execute este script passo a passo para identificar e corrigir o problema "algum-id"
-- ===============================

-- PASSO 1: DIAGNÓSTICO COMPLETO
-- ===============================

-- 1.1 Verificar problemas na tabela public.usuarios
SELECT 
    'public.usuarios' as tabela,
    id,
    email,
    nome_completo,
    filial_id::text as filial_id_valor,
    CASE 
        WHEN filial_id IS NULL THEN 'NULL'
        WHEN filial_id::text = '' THEN 'VAZIO'
        ELSE 'VÁLIDO'
    END as status_filial_id
FROM usuarios 
WHERE filial_id IS NULL
ORDER BY data_criacao DESC;

-- 1.2 Verificar problemas na tabela auth.users (ESTA É A FONTE PRINCIPAL DO PROBLEMA!)
SELECT 
    'auth.users' as tabela,
    id,
    email,
    raw_user_meta_data->>'nome_completo' as nome_completo,
    raw_user_meta_data->>'filial_id' as filial_id_valor,
    CASE 
        WHEN raw_user_meta_data->>'filial_id' IS NULL THEN 'NULL'
        WHEN raw_user_meta_data->>'filial_id' = '' THEN 'VAZIO'
        WHEN raw_user_meta_data->>'filial_id' = 'algum-id' THEN 'ALGUM-ID_ENCONTRADO!'
        WHEN raw_user_meta_data->>'filial_id' !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN 'UUID_INVÁLIDO'
        ELSE 'VÁLIDO'
    END as status_filial_id
FROM auth.users 
WHERE raw_user_meta_data->>'filial_id' IS NOT NULL
  AND (raw_user_meta_data->>'filial_id' = '' 
       OR raw_user_meta_data->>'filial_id' = 'algum-id'
       OR raw_user_meta_data->>'filial_id' !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')
ORDER BY created_at DESC;

-- 1.3 Buscar especificamente o valor "algum-id" que está causando o erro
SELECT 
    'PROCURANDO algum-id' as busca,
    COUNT(*) as total_encontrados
FROM auth.users 
WHERE raw_user_meta_data->>'filial_id' = 'algum-id';

-- 1.4 Mostrar todos os registros com "algum-id"
SELECT 
    id,
    email,
    created_at,
    raw_user_meta_data->>'filial_id' as filial_id_problema,
    raw_user_meta_data
FROM auth.users 
WHERE raw_user_meta_data->>'filial_id' = 'algum-id';

-- ===============================
-- PASSO 2: CORREÇÃO DEFINITIVA
-- ===============================
-- ATENÇÃO: Execute somente após revisar os resultados do diagnóstico!

-- 2.1 REMOVER TODOS OS FILIAL_ID INVÁLIDOS DE AUTH.USERS (incluindo "algum-id")
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data - 'filial_id'
WHERE raw_user_meta_data->>'filial_id' IS NOT NULL
  AND (raw_user_meta_data->>'filial_id' = '' 
       OR raw_user_meta_data->>'filial_id' = 'algum-id'
       OR raw_user_meta_data->>'filial_id' !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$');

-- Correção adicional: Definir filial_id como NULL para registros inválidos na tabela public.usuarios (se houver)
UPDATE usuarios 
SET filial_id = NULL 
WHERE filial_id IS NULL;

-- Verificação: Contar usuários após correção
SELECT 
    'public.usuarios' as tabela,
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN filial_id IS NOT NULL THEN 1 END) as usuarios_com_filial
FROM usuarios

UNION ALL

SELECT 
    'auth.users' as tabela,
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN raw_user_meta_data->>'filial_id' IS NOT NULL 
                AND raw_user_meta_data->>'filial_id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' 
              THEN 1 END) as usuarios_com_filial
FROM auth.users;

-- Query adicional: Verificar se existem filiais válidas no sistema
SELECT COUNT(*) as total_filiais FROM filiais;

-- ===============================
-- PASSO 3: VERIFICAÇÃO FINAL
-- ===============================

-- 3.1 Verificar se ainda existem problemas em auth.users
SELECT 
    'Problemas restantes em auth.users' as status,
    COUNT(*) as quantidade
FROM auth.users 
WHERE raw_user_meta_data->>'filial_id' IS NOT NULL
  AND (raw_user_meta_data->>'filial_id' = '' 
       OR raw_user_meta_data->>'filial_id' = 'algum-id'
       OR raw_user_meta_data->>'filial_id' !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$');

-- 3.2 Verificar especificamente se "algum-id" foi removido
SELECT 
    'Verificação algum-id removido' as status,
    COUNT(*) as ainda_existem
FROM auth.users 
WHERE raw_user_meta_data->>'filial_id' = 'algum-id';

-- 3.3 Testar a função get_users_with_auth_status para ver se ainda falha
-- Execute esta linha manualmente no console do Supabase:
-- SELECT * FROM get_users_with_auth_status(NULL) LIMIT 5;