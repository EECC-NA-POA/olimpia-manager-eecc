-- ============================================
-- Correção para Exclusão de Usuários Auth-Only
-- ============================================

-- Recriar a função get_user_details_for_deletion para lidar com usuários auth-only
CREATE OR REPLACE FUNCTION get_user_details_for_deletion(p_user_id UUID)
RETURNS TABLE(
  email TEXT,
  numero_documento TEXT,
  is_auth_only BOOLEAN,
  exists_in_usuarios BOOLEAN,
  exists_in_auth BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_in_usuarios RECORD;
  user_in_auth RECORD;
  auth_metadata JSONB;
BEGIN
  -- Verificar se usuário existe na tabela public.usuarios
  SELECT u.email, u.numero_documento
  INTO user_in_usuarios
  FROM public.usuarios u
  WHERE u.id = p_user_id;

  -- Verificar se usuário existe na tabela auth.users
  SELECT au.email, au.raw_user_meta_data
  INTO user_in_auth
  FROM auth.users au
  WHERE au.id = p_user_id;

  -- Se não existe em nenhuma tabela, retornar vazio
  IF user_in_usuarios IS NULL AND user_in_auth IS NULL THEN
    RETURN;
  END IF;

  -- Se existe em usuarios (usuário completo)
  IF user_in_usuarios IS NOT NULL THEN
    RETURN QUERY SELECT 
      user_in_usuarios.email,
      user_in_usuarios.numero_documento,
      FALSE as is_auth_only,
      TRUE as exists_in_usuarios,
      (user_in_auth IS NOT NULL) as exists_in_auth;
    RETURN;
  END IF;

  -- Se existe apenas em auth.users (usuário auth-only)
  IF user_in_auth IS NOT NULL THEN
    auth_metadata := user_in_auth.raw_user_meta_data;
    
    RETURN QUERY SELECT 
      user_in_auth.email,
      COALESCE(auth_metadata->>'numero_documento', '') as numero_documento,
      TRUE as is_auth_only,
      FALSE as exists_in_usuarios,
      TRUE as exists_in_auth;
    RETURN;
  END IF;

END;
$$;

-- Garantir que a função pode ser executada por usuários autenticados
GRANT EXECUTE ON FUNCTION get_user_details_for_deletion(UUID) TO authenticated;

-- Adicionar comentário explicativo
COMMENT ON FUNCTION get_user_details_for_deletion(UUID) IS 
'Busca dados de usuário para validação de exclusão, funcionando tanto para usuários completos (na tabela usuarios) quanto para usuários auth-only (apenas na tabela auth.users)';

-- Log de execução
DO $$ 
BEGIN 
  RAISE NOTICE 'Função get_user_details_for_deletion atualizada com sucesso para suportar usuários auth-only';
END $$;