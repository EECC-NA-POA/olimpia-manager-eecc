
-- Função para criar usuário em auth.users
-- Esta função deve ser criada no Supabase como uma função RPC
CREATE OR REPLACE FUNCTION create_auth_user(
  user_email text,
  user_password text,
  user_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Generate new UUID
  user_id := gen_random_uuid();
  
  -- Insert into auth.users
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    raw_user_meta_data
  ) VALUES (
    user_id,
    user_email,
    crypt(user_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    user_metadata
  );
  
  RETURN user_id;
END;
$$;

-- Função para excluir usuário de auth.users
CREATE OR REPLACE FUNCTION delete_auth_user(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = user_id;
  RETURN FOUND;
END;
$$;

-- Garantir que as funções podem ser chamadas via RPC
GRANT EXECUTE ON FUNCTION create_auth_user(text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_auth_user(uuid) TO authenticated;
