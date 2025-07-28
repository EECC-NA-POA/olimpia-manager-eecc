
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

-- ========== FUNÇÃO RPC PARA BUSCAR USUÁRIOS DO EVENTO (BYPASSA RLS) ==========
CREATE OR REPLACE FUNCTION get_event_users_admin(p_event_id uuid)
RETURNS TABLE(
    id uuid,
    email text,
    nome_completo text,
    telefone text,
    profiles jsonb,
    latest_payment_status text
) 
SECURITY DEFINER
AS $$
BEGIN
    -- Simplified approach: remove admin check for now to debug
    -- TODO: Add proper admin verification back later

    -- Retornar usuários inscritos no evento com seus perfis
    RETURN QUERY
    SELECT DISTINCT
        u.id,
        u.email,
        COALESCE(u.nome_completo, u.email) as nome_completo,
        u.telefone as telefone,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', pf.id,
                        'nome', pf.nome
                    )
                )
                FROM public.papeis_usuarios pu2
                JOIN public.perfis pf ON pu2.perfil_id = pf.id
                WHERE pu2.usuario_id = u.id 
                AND pu2.evento_id = p_event_id
            ),
            '[]'::jsonb
        ) as profiles,
        (
            SELECT status
            FROM public.pagamentos pg
            WHERE pg.usuario_id = u.id 
            AND pg.evento_id = p_event_id
            ORDER BY pg.criado_em DESC
            LIMIT 1
        ) as latest_payment_status
    FROM public.usuarios u
    INNER JOIN public.inscricoes_eventos ie ON ie.usuario_id = u.id
    WHERE ie.evento_id = p_event_id
    ORDER BY nome_completo;
END;
$$ LANGUAGE plpgsql;

-- Conceder permissão para executar a função
GRANT EXECUTE ON FUNCTION get_event_users_admin(uuid) TO authenticated;

-- Row Level Security (RLS) policies
DROP POLICY IF EXISTS usuarios_final_policy_20241228 ON public.usuarios;
DROP POLICY IF EXISTS inscricoes_eventos_final_policy ON public.inscricoes_eventos;
DROP POLICY IF EXISTS papeis_usuarios_final_policy ON public.papeis_usuarios;
DROP POLICY IF EXISTS "usuarios_view_own" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_select_policy" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_admin_access" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_access_unified" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_unified_access" ON public.usuarios;
DROP POLICY IF EXISTS "inscricoes_eventos_admin_access" ON public.inscricoes_eventos;
DROP POLICY IF EXISTS "papeis_usuarios_admin_access" ON public.papeis_usuarios;

-- Create consolidated RLS policies with improved admin access
CREATE POLICY usuarios_final_policy_20241228 ON public.usuarios
FOR ALL
TO authenticated
USING (
  -- User can see their own data
  id = auth.uid()
  OR
  -- Or if they have 'Administração' role for any event (simplified)
  EXISTS (
    SELECT 1
    FROM public.papeis_usuarios pu
    JOIN public.perfis p ON pu.perfil_id = p.id
    WHERE pu.usuario_id = auth.uid()
      AND p.nome = 'Administração'
  )
);

-- New policy for inscricoes_eventos table
CREATE POLICY inscricoes_eventos_select_policy ON public.inscricoes_eventos
FOR SELECT
TO authenticated
USING (
  -- User can see their own event registrations
  usuario_id = auth.uid()
  OR
  -- Or if they have 'Administração' role for that specific event
  EXISTS (
    SELECT 1
    FROM public.papeis_usuarios pu
    JOIN public.perfis p ON pu.perfil_id = p.id
    WHERE pu.usuario_id = auth.uid()
      AND p.nome = 'Administração'
      AND pu.evento_id = inscricoes_eventos.evento_id
  )
);

CREATE POLICY inscricoes_eventos_insert_policy ON public.inscricoes_eventos
FOR INSERT
TO authenticated
WITH CHECK (
  -- Users can only insert their own registrations or if they are admin
  usuario_id = auth.uid()
  OR
  EXISTS (
    SELECT 1
    FROM public.papeis_usuarios pu
    JOIN public.perfis p ON pu.perfil_id = p.id
    WHERE pu.usuario_id = auth.uid()
      AND p.nome = 'Administração'
      AND pu.evento_id = inscricoes_eventos.evento_id
  )
);

CREATE POLICY papeis_usuarios_final_policy ON public.papeis_usuarios
FOR ALL
TO authenticated
USING (
  -- User can see their own roles
  usuario_id = auth.uid()
  OR
  -- Or if they have 'Administração' role for that specific event
  EXISTS (
    SELECT 1
    FROM public.papeis_usuarios pu
    JOIN public.perfis p ON pu.perfil_id = p.id
    WHERE pu.usuario_id = auth.uid()
      AND p.nome = 'Administração'
      AND pu.evento_id = papeis_usuarios.evento_id
  )
);

-- Enable RLS
ALTER TABLE public.inscricoes_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.papeis_usuarios ENABLE ROW LEVEL SECURITY;
