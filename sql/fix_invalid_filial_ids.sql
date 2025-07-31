-- Diagnóstico: Encontrar usuários com filial_id inválidos
-- Esta query identifica todos os registros com UUIDs inválidos

SELECT 
    id,
    email,
    nome_completo,
    filial_id,
    CASE 
        WHEN filial_id IS NULL THEN 'NULL'
        WHEN filial_id = '' THEN 'VAZIO'
        WHEN filial_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN 'UUID_INVÁLIDO'
        ELSE 'VÁLIDO'
    END as status_filial_id
FROM usuarios 
WHERE filial_id IS NULL 
   OR filial_id = '' 
   OR filial_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
ORDER BY created_at DESC;

-- Correção: Definir filial_id como NULL para registros inválidos
-- ATENÇÃO: Execute esta query após revisar os resultados da query de diagnóstico

UPDATE usuarios 
SET filial_id = NULL 
WHERE filial_id IS NOT NULL 
  AND filial_id != '' 
  AND filial_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

-- Verificação: Contar usuários sem filial válida após correção
SELECT 
    COUNT(*) as total_usuarios_sem_filial,
    COUNT(CASE WHEN filial_id IS NOT NULL THEN 1 END) as usuarios_com_filial
FROM usuarios;

-- Query adicional: Verificar se existem filiais válidas no sistema
SELECT COUNT(*) as total_filiais FROM filiais;