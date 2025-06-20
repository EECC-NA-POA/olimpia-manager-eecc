
-- VERIFICAR E CORRIGIR REGISTRO DE USUÁRIOS
-- Execute este SQL completo para resolver o problema de registro

-- ============================================
-- 1. VERIFICAR ESTRUTURA DA TABELA USUARIOS
-- ============================================

-- Primeiro, vamos ver quais colunas realmente existem
DO $$
DECLARE
    col_record RECORD;
BEGIN
    RAISE NOTICE '=== ESTRUTURA DA TABELA USUARIOS ===';
    FOR col_record IN 
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'usuarios'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Coluna: % | Tipo: % | Nula: %', col_record.column_name, col_record.data_type, col_record.is_nullable;
    END LOOP;
END $$;

-- ============================================
-- 2. LIMPAR TUDO E RECRIAR
-- ============================================

-- Remover trigger e função existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Remover todas as políticas RLS
DROP POLICY IF EXISTS "Users can view own data" ON public.usuarios;
DROP POLICY IF EXISTS "Allow trigger insert" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_select_own" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_insert_trigger" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update_own" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_select_policy" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_insert_policy" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update_policy" ON public.usuarios;

-- ============================================
-- 3. CRIAR POLÍTICAS RLS BÁSICAS
-- ============================================

-- Política para visualização própria
CREATE POLICY "usuarios_view_own" 
ON public.usuarios 
FOR SELECT 
USING (auth.uid() = id);

-- Política para inserção (permite tudo para a trigger funcionar)
CREATE POLICY "usuarios_insert_all" 
ON public.usuarios 
FOR INSERT 
WITH CHECK (true);

-- Política para atualização própria
CREATE POLICY "usuarios_update_own" 
ON public.usuarios 
FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- ============================================
-- 4. CRIAR FUNÇÃO MINIMALISTA PARA TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
    user_exists boolean := false;
BEGIN
    -- Verificar se usuário já existe
    SELECT EXISTS(SELECT 1 FROM public.usuarios WHERE id = NEW.id) INTO user_exists;
    
    IF user_exists THEN
        RETURN NEW;
    END IF;
    
    -- Inserir dados básicos (apenas colunas que sabemos que existem)
    INSERT INTO public.usuarios (id, email)
    VALUES (NEW.id, COALESCE(NEW.email, ''))
    ON CONFLICT (id) DO NOTHING;
    
    -- Tentar atribuir papel de atleta se existe
    BEGIN
        INSERT INTO public.papeis_usuarios (usuario_id, perfil_id)
        SELECT NEW.id, id 
        FROM public.perfis 
        WHERE codigo = 'ATL' OR nome ILIKE '%atleta%' 
        LIMIT 1
        ON CONFLICT DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        -- Ignorar erro se não conseguir atribuir papel
    END;
    
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    -- Não falhar a criação do usuário por causa da trigger
    RETURN NEW;
END;
$$;

-- ============================================
-- 5. CRIAR TRIGGER
-- ============================================

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. GARANTIR PERMISSÕES
-- ============================================

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

-- ============================================
-- 7. TESTE AUTOMATICO
-- ============================================

-- Limpar usuário de teste
DELETE FROM auth.users WHERE email = 'teste-minimo@exemplo.com';
DELETE FROM public.usuarios WHERE email = 'teste-minimo@exemplo.com';

-- Inserir usuário de teste
DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
    auth_count integer;
    public_count integer;
BEGIN
    -- Inserir usuário
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        confirmation_token
    ) VALUES (
        test_user_id,
        'teste-minimo@exemplo.com',
        crypt('123456', gen_salt('bf')),
        now(),
        now(),
        now(),
        ''
    );
    
    -- Aguardar um pouco
    PERFORM pg_sleep(1);
    
    -- Verificar resultado
    SELECT COUNT(*) INTO auth_count FROM auth.users WHERE email = 'teste-minimo@exemplo.com';
    SELECT COUNT(*) INTO public_count FROM public.usuarios WHERE email = 'teste-minimo@exemplo.com';
    
    RAISE NOTICE '=== RESULTADO DO TESTE ===';
    RAISE NOTICE 'Auth users: %', auth_count;
    RAISE NOTICE 'Public usuarios: %', public_count;
    
    IF auth_count = 1 AND public_count = 1 THEN
        RAISE NOTICE 'SUCESSO: Trigger funcionando!';
    ELSE
        RAISE NOTICE 'PROBLEMA: Trigger não está funcionando';
    END IF;
END $$;

-- Comentário
COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger minimalista para processar novos usuários - versão compatível com estrutura existente';
