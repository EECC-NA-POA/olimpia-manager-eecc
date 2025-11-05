-- Security patches for critical vulnerabilities
-- These should be applied to the Supabase database

-- ============= PATCH 1: Fix overly permissive RLS policy =============
-- Remove the temporary permissive policy for inscricoes_eventos
DROP POLICY IF EXISTS inscricoes_eventos_select_policy ON public.inscricoes_eventos;

-- Create proper event-scoped policy
CREATE POLICY inscricoes_eventos_secure_select_policy ON public.inscricoes_eventos
FOR SELECT
TO authenticated
USING (
  -- Users can see their own registrations
  usuario_id = auth.uid()
  OR
  -- Or if they are admin for this specific event
  EXISTS (
    SELECT 1
    FROM public.papeis_usuarios pu
    JOIN public.perfis p ON pu.perfil_id = p.id
    WHERE pu.usuario_id = auth.uid()
      AND p.nome = 'Administração'
      AND pu.evento_id = inscricoes_eventos.evento_id
  )
);

-- ============= PATCH 2: Secure user creation function =============
-- Add authorization check to create_auth_user function
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
  is_authorized boolean := false;
BEGIN
  -- Check if current user has authorization to create users
  -- Must be authenticated and have admin role
  SELECT EXISTS (
    SELECT 1
    FROM public.papeis_usuarios pu
    JOIN public.perfis p ON pu.perfil_id = p.id
    WHERE pu.usuario_id = auth.uid()
      AND p.nome = 'Administração'
  ) INTO is_authorized;
  
  IF NOT is_authorized THEN
    RAISE EXCEPTION 'Acesso negado: Apenas administradores podem criar usuários';
  END IF;
  
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

-- ============= PATCH 3: Add authorization to get_event_users_admin =============
CREATE OR REPLACE FUNCTION get_event_users_admin(p_event_id uuid)
RETURNS TABLE(
    id uuid,
    email text,
    nome_completo text,
    telefone text,
    filial_id uuid,
    tipo_documento text,
    numero_documento text,
    genero text,
    confirmado boolean,
    criado_em timestamp with time zone,
    perfis jsonb,
    ultimo_pagamento jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean := false;
BEGIN
  -- Check if current user is admin for this event
  SELECT EXISTS (
    SELECT 1
    FROM public.papeis_usuarios pu
    JOIN public.perfis p ON pu.perfil_id = p.id
    WHERE pu.usuario_id = auth.uid()
      AND p.nome = 'Administração'
      AND pu.evento_id = p_event_id
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Acesso negado: Apenas administradores deste evento podem acessar dados de usuários';
  END IF;

  -- Return user data if authorized
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.nome_completo,
    u.telefone,
    u.filial_id,
    u.tipo_documento,
    u.numero_documento,
    u.genero,
    u.confirmado,
    u.criado_em,
    COALESCE(
      json_agg(
        json_build_object(
          'id', p.id,
          'nome', p.nome,
          'codigo', p.codigo,
          'descricao', p.descricao
        )
      ) FILTER (WHERE p.id IS NOT NULL),
      '[]'::json
    )::jsonb as perfis,
    (
      SELECT json_build_object(
        'status', pg.status,
        'valor', pg.valor,
        'criado_em', pg.criado_em
      )::jsonb
      FROM public.pagamentos pg
      WHERE pg.atleta_id = u.id 
        AND pg.evento_id = p_event_id
      ORDER BY pg.criado_em DESC
      LIMIT 1
    ) as ultimo_pagamento
  FROM public.usuarios u
  LEFT JOIN public.papeis_usuarios pu ON u.id = pu.usuario_id AND pu.evento_id = p_event_id
  LEFT JOIN public.perfis p ON pu.perfil_id = p.id
  WHERE EXISTS (
    SELECT 1 FROM public.inscricoes_eventos ie 
    WHERE ie.usuario_id = u.id AND ie.evento_id = p_event_id
  )
  GROUP BY u.id, u.email, u.nome_completo, u.telefone, u.filial_id, 
           u.tipo_documento, u.numero_documento, u.genero, u.confirmado, u.criado_em;
END;
$$;

-- ============= PATCH 4: Create secure profile swap function =============
CREATE OR REPLACE FUNCTION swap_user_profile(
  p_user_id uuid,
  p_event_id uuid,
  p_new_profile_id integer,
  p_old_profile_id integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_authorized boolean := false;
  is_admin_profile boolean := false;
  caller_is_admin boolean := false;
BEGIN
  -- Check if current user can modify this profile
  -- Users can modify their own profiles, or admins can modify any profile
  IF auth.uid() = p_user_id THEN
    is_authorized := true;
  ELSE
    -- Check if caller is admin for this event
    SELECT EXISTS (
      SELECT 1
      FROM public.papeis_usuarios pu
      JOIN public.perfis p ON pu.perfil_id = p.id
      WHERE pu.usuario_id = auth.uid()
        AND p.nome = 'Administração'
        AND pu.evento_id = p_event_id
    ) INTO caller_is_admin;
    
    is_authorized := caller_is_admin;
  END IF;
  
  IF NOT is_authorized THEN
    RAISE EXCEPTION 'Acesso negado: Você não tem permissão para modificar este perfil';
  END IF;
  
  -- Check if new profile is admin profile (prevent privilege escalation)
  SELECT (nome = 'Administração') 
  FROM public.perfis 
  WHERE id = p_new_profile_id 
  INTO is_admin_profile;
  
  -- If assigning admin profile, caller must be admin
  IF is_admin_profile AND NOT caller_is_admin THEN
    RAISE EXCEPTION 'Acesso negado: Apenas administradores podem atribuir perfis administrativos';
  END IF;
  
  -- Perform the swap
  UPDATE public.papeis_usuarios
  SET perfil_id = p_new_profile_id
  WHERE usuario_id = p_user_id 
    AND evento_id = p_event_id 
    AND perfil_id = p_old_profile_id;
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Perfil não encontrado ou não pode ser modificado';
  END IF;
END;
$$;

-- ============= PATCH 5: Create secure profile assignment function =============
CREATE OR REPLACE FUNCTION assign_user_profiles(
  p_user_id uuid,
  p_profile_ids integer[],
  p_event_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_authorized boolean := false;
  has_admin_profile boolean := false;
  caller_is_admin boolean := false;
  profile_id integer;
BEGIN
  -- Check if current user can modify this profile
  IF auth.uid() = p_user_id THEN
    is_authorized := true;
  ELSE
    -- Check if caller is admin for this event
    SELECT EXISTS (
      SELECT 1
      FROM public.papeis_usuarios pu
      JOIN public.perfis p ON pu.perfil_id = p.id
      WHERE pu.usuario_id = auth.uid()
        AND p.nome = 'Administração'
        AND pu.evento_id = p_event_id
    ) INTO caller_is_admin;
    
    is_authorized := caller_is_admin;
  END IF;
  
  IF NOT is_authorized THEN
    RAISE EXCEPTION 'Acesso negado: Você não tem permissão para modificar este perfil';
  END IF;
  
  -- Check if any of the profiles is admin (prevent privilege escalation)
  SELECT EXISTS (
    SELECT 1 
    FROM public.perfis 
    WHERE id = ANY(p_profile_ids) 
      AND nome = 'Administração'
  ) INTO has_admin_profile;
  
  IF has_admin_profile AND NOT caller_is_admin THEN
    RAISE EXCEPTION 'Acesso negado: Apenas administradores podem atribuir perfis administrativos';
  END IF;
  
  -- Delete existing profiles for this user/event
  DELETE FROM public.papeis_usuarios 
  WHERE usuario_id = p_user_id AND evento_id = p_event_id;
  
  -- Insert new profiles
  FOREACH profile_id IN ARRAY p_profile_ids
  LOOP
    INSERT INTO public.papeis_usuarios (usuario_id, evento_id, perfil_id)
    VALUES (p_user_id, p_event_id, profile_id);
  END LOOP;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION swap_user_profile(uuid, uuid, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION assign_user_profiles(uuid, integer[], uuid) TO authenticated;