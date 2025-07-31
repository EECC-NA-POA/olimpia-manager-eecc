-- Diagnóstico: Encontrar usuários com filial_id inválidos nas tabelas públicas e auth
-- Esta query identifica todos os registros com UUIDs inválidos

-- Verificar problemas na tabela public.usuarios
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

-- Verificar problemas na tabela auth.users
SELECT 
    'auth.users' as tabela,
    id,
    email,
    raw_user_meta_data->>'nome_completo' as nome_completo,
    raw_user_meta_data->>'filial_id' as filial_id_valor,
    CASE 
        WHEN raw_user_meta_data->>'filial_id' IS NULL THEN 'NULL'
        WHEN raw_user_meta_data->>'filial_id' = '' THEN 'VAZIO'
        WHEN raw_user_meta_data->>'filial_id' !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN 'UUID_INVÁLIDO'
        ELSE 'VÁLIDO'
    END as status_filial_id
FROM auth.users 
WHERE raw_user_meta_data->>'filial_id' IS NOT NULL
  AND (raw_user_meta_data->>'filial_id' = '' 
       OR raw_user_meta_data->>'filial_id' !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')
ORDER BY created_at DESC;

-- Correção: Limpar filial_id inválidos da tabela auth.users
-- ATENÇÃO: Execute esta query após revisar os resultados da query de diagnóstico

UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data - 'filial_id'
WHERE raw_user_meta_data->>'filial_id' IS NOT NULL
  AND (raw_user_meta_data->>'filial_id' = '' 
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

-- Verificar se ainda existem problemas
SELECT 
    'Problemas restantes em auth.users' as status,
    COUNT(*) as quantidade
FROM auth.users 
WHERE raw_user_meta_data->>'filial_id' IS NOT NULL
  AND (raw_user_meta_data->>'filial_id' = '' 
       OR raw_user_meta_data->>'filial_id' !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$');