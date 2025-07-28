
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
    -- Verificar se o usuário atual tem permissão de administração para este evento
    IF NOT EXISTS (
        SELECT 1 
        FROM public.papeis_usuarios pu
        JOIN public.perfis p ON pu.perfil_id = p.id
        WHERE pu.usuario_id = auth.uid() 
        AND pu.evento_id = p_event_id
        AND p.nome = 'Administração'
    ) THEN
        RAISE EXCEPTION 'Você não tem permissão administrativa para este evento';
    END IF;

    -- Retornar usuários inscritos no evento com seus perfis
    RETURN QUERY
    SELECT DISTINCT
        u.id,
        u.email,
        COALESCE(u.user_metadata->>'nome_completo', u.email) as nome_completo,
        u.user_metadata->>'telefone' as telefone,
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
    FROM auth.users u
    INNER JOIN public.inscricoes_eventos ie ON ie.usuario_id = u.id
    WHERE ie.evento_id = p_event_id
    ORDER BY nome_completo;
END;
$$ LANGUAGE plpgsql;

-- Conceder permissão para executar a função
GRANT EXECUTE ON FUNCTION get_event_users_admin(uuid) TO authenticated;

-- ========== FIX FINAL PARA RLS POLICIES - 2024-12-28 ==========
-- Esta é a correção definitiva para o problema de listagem de usuários

-- Remover TODAS as políticas conflitantes da tabela usuarios
DROP POLICY IF EXISTS "usuarios_view_own" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_select_policy" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_admin_access" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_access_unified" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_unified_access" ON public.usuarios;

-- Criar a política DEFINITIVA e ÚNICA para a tabela usuarios
CREATE POLICY "usuarios_final_policy_20241228" 
ON public.usuarios 
FOR SELECT 
USING (
    auth.uid() = id OR  -- Usuários veem seus próprios dados
    EXISTS (
        SELECT 1 
        FROM public.papeis_usuarios pu
        JOIN public.perfis p ON pu.perfil_id = p.id
        WHERE pu.usuario_id = auth.uid() 
        AND p.nome = 'Administração'
        AND pu.evento_id IN (
            SELECT evento_id 
            FROM public.inscricoes_eventos ie 
            WHERE ie.usuario_id = usuarios.id
        )
    )
);

-- Garantir que RLS está habilitado nas tabelas relacionadas
ALTER TABLE public.inscricoes_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.papeis_usuarios ENABLE ROW LEVEL SECURITY;

-- Política para inscricoes_eventos
DROP POLICY IF EXISTS "inscricoes_eventos_admin_access" ON public.inscricoes_eventos;
CREATE POLICY "inscricoes_eventos_final_policy" 
ON public.inscricoes_eventos 
FOR SELECT 
USING (
    usuario_id = auth.uid() OR
    EXISTS (
        SELECT 1 
        FROM public.papeis_usuarios pu
        JOIN public.perfis p ON pu.perfil_id = p.id
        WHERE pu.usuario_id = auth.uid() 
        AND pu.evento_id = inscricoes_eventos.evento_id
        AND p.nome = 'Administração'
    )
);

-- Política para papeis_usuarios
DROP POLICY IF EXISTS "papeis_usuarios_admin_access" ON public.papeis_usuarios;
CREATE POLICY "papeis_usuarios_final_policy" 
ON public.papeis_usuarios 
FOR SELECT 
USING (
    usuario_id = auth.uid() OR
    EXISTS (
        SELECT 1 
        FROM public.papeis_usuarios pu2
        JOIN public.perfis p ON pu2.perfil_id = p.id
        WHERE pu2.usuario_id = auth.uid() 
        AND pu2.evento_id = papeis_usuarios.evento_id
        AND p.nome = 'Administração'
    )
);
