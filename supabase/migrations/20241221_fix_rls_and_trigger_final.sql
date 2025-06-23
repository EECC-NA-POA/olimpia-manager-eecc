
-- SOLUÇÃO DEFINITIVA PARA TRIGGER DE USUÁRIOS
-- Execute este SQL completo para resolver o problema

-- ============================================
-- 1. LIMPAR TUDO E COMEÇAR DO ZERO
-- ============================================

-- Remover trigger e função existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Remover todas as políticas RLS da tabela usuarios
DROP POLICY IF EXISTS "Users can view own data" ON public.usuarios;
DROP POLICY IF EXISTS "Allow trigger insert" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_select_own" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_insert_trigger" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update_own" ON public.usuarios;

-- ============================================
-- 2. CRIAR POLÍTICAS RLS CORRETAS
-- ============================================

-- Política para usuários verem seus próprios dados
CREATE POLICY "usuarios_select_policy" 
ON public.usuarios 
FOR SELECT 
USING (auth.uid() = id);

-- Política para inserção via trigger (SEM RESTRIÇÕES)
CREATE POLICY "usuarios_insert_policy" 
ON public.usuarios 
FOR INSERT 
WITH CHECK (true);

-- Política para usuários atualizarem seus próprios dados
CREATE POLICY "usuarios_update_policy" 
ON public.usuarios 
FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- ============================================
-- 3. CRIAR FUNÇÃO DA TRIGGER MELHORADA
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public, auth, extensions
LANGUAGE plpgsql
AS $$
DECLARE
    user_exists boolean := false;
    perfil_atleta_id uuid;
BEGIN
    -- Log inicial detalhado
    RAISE NOTICE '=== TRIGGER INICIADA ===';
    RAISE NOTICE 'Usuario: % (ID: %)', NEW.email, NEW.id;
    RAISE NOTICE 'Metadados: %', NEW.raw_user_meta_data;
    RAISE NOTICE 'Timestamp: %', now();
    
    -- Verificar se usuário já existe
    SELECT EXISTS(SELECT 1 FROM public.usuarios WHERE id = NEW.id) INTO user_exists;
    
    IF user_exists THEN
        RAISE NOTICE 'AVISO: Usuario % ja existe na tabela publica', NEW.email;
        RETURN NEW;
    END IF;
    
    -- Tentar inserir na tabela pública
    RAISE NOTICE 'Tentando inserir usuario na tabela publica...';
    
    BEGIN
        INSERT INTO public.usuarios (
            id,
            email,
            nome_completo,
            telefone,
            ddi,
            tipo_documento,
            numero_documento,
            genero,
            data_nascimento,
            estado,
            filial_id,
            data_criacao,
            confirmado
        ) VALUES (
            NEW.id,
            COALESCE(NEW.email, ''),
            COALESCE(NEW.raw_user_meta_data->>'nome_completo', ''),
            COALESCE(NEW.raw_user_meta_data->>'telefone', ''),
            COALESCE(NEW.raw_user_meta_data->>'ddi', '+55'),
            COALESCE(NEW.raw_user_meta_data->>'tipo_documento', 'CPF'),
            COALESCE(NEW.raw_user_meta_data->>'numero_documento', ''),
            COALESCE(NEW.raw_user_meta_data->>'genero', ''),
            CASE 
                WHEN NEW.raw_user_meta_data->>'data_nascimento' IS NOT NULL 
                    AND NEW.raw_user_meta_data->>'data_nascimento' != ''
                THEN (NEW.raw_user_meta_data->>'data_nascimento')::date 
                ELSE NULL 
            END,
            COALESCE(NEW.raw_user_meta_data->>'estado', ''),
            COALESCE(NEW.raw_user_meta_data->>'filial_id', ''),
            NOW(),
            true
        );
        
        RAISE NOTICE 'SUCESSO: Usuario % inserido na tabela publica!', NEW.email;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERRO na insercao na tabela publica:';
        RAISE NOTICE 'Usuario: %', NEW.email;
        RAISE NOTICE 'Erro: %', SQLERRM;
        RAISE NOTICE 'Estado: %', SQLSTATE;
        RAISE NOTICE 'Detalhes: %', SQLERRM;
        -- Continuar execução mesmo com erro
    END;
    
    -- Tentar atribuir papel de atleta
    RAISE NOTICE 'Tentando atribuir papel de atleta...';
    
    BEGIN
        -- Buscar ID do perfil atleta
        SELECT id INTO perfil_atleta_id 
        FROM public.perfis 
        WHERE codigo = 'ATL' OR nome ILIKE '%atleta%' 
        LIMIT 1;
        
        IF perfil_atleta_id IS NOT NULL THEN
            INSERT INTO public.papeis_usuarios (usuario_id, perfil_id)
            VALUES (NEW.id, perfil_atleta_id)
            ON CONFLICT DO NOTHING;
            
            RAISE NOTICE 'SUCESSO: Papel de atleta atribuido para usuario %', NEW.email;
        ELSE
            RAISE NOTICE 'AVISO: Perfil de atleta nao encontrado';
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERRO ao atribuir papel:';
        RAISE NOTICE 'Usuario: %', NEW.email;
        RAISE NOTICE 'Erro: %', SQLERRM;
    END;
    
    RAISE NOTICE '=== TRIGGER FINALIZADA ===';
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERRO CRITICO na trigger:';
    RAISE NOTICE 'Usuario: %', NEW.email;
    RAISE NOTICE 'Erro: %', SQLERRM;
    RAISE NOTICE 'Estado: %', SQLSTATE;
    RETURN NEW;
END;
$$;

-- ============================================
-- 4. CRIAR TRIGGER
-- ============================================

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. GARANTIR PERMISSÕES
-- ============================================

-- Permissões para a função
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

-- Permissões para as tabelas
GRANT INSERT ON public.usuarios TO postgres;
GRANT INSERT ON public.papeis_usuarios TO postgres;
GRANT SELECT ON public.perfis TO postgres;

-- ============================================
-- 6. COMENTÁRIOS E LOGS
-- ============================================

COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger para processar novos usuários - VERSÃO FINAL com RLS corrigido';

-- Log de conclusão
DO $$
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE 'CONFIGURACAO COMPLETA - TRIGGER RECRIADA';
    RAISE NOTICE 'Proximos passos:';
    RAISE NOTICE '1. Teste inserindo um novo usuario';
    RAISE NOTICE '2. Verifique os logs de NOTICE';
    RAISE NOTICE '3. Confirme se aparece em ambas as tabelas';
    RAISE NOTICE '================================================';
END $$;

-- ============================================
-- 7. TESTE AUTOMATICO
-- ============================================

-- Remover usuário de teste se existir
DELETE FROM auth.users WHERE email = 'teste-trigger@exemplo.com';
DELETE FROM public.usuarios WHERE email = 'teste-trigger@exemplo.com';

-- Inserir usuário de teste
DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
BEGIN
    RAISE NOTICE 'Inserindo usuario de teste...';
    
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
        test_user_id,
        'teste-trigger@exemplo.com',
        crypt('123456', gen_salt('bf')),
        now(),
        now(),
        now(),
        '',
        '{"nome_completo": "Teste Trigger", "telefone": "11999999999", "estado": "SP", "filial_id": "teste"}'::jsonb
    );
    
    RAISE NOTICE 'Usuario de teste inserido com ID: %', test_user_id;
END $$;

-- Verificar resultado do teste
DO $$
DECLARE
    auth_count integer;
    public_count integer;
BEGIN
    SELECT COUNT(*) INTO auth_count FROM auth.users WHERE email = 'teste-trigger@exemplo.com';
    SELECT COUNT(*) INTO public_count FROM public.usuarios WHERE email = 'teste-trigger@exemplo.com';
    
    RAISE NOTICE '================================================';
    RAISE NOTICE 'RESULTADO DO TESTE:';
    RAISE NOTICE 'Usuarios em auth.users: %', auth_count;
    RAISE NOTICE 'Usuarios em public.usuarios: %', public_count;
    
    IF auth_count = 1 AND public_count = 1 THEN
        RAISE NOTICE 'SUCESSO: Trigger funcionando corretamente!';
    ELSE
        RAISE NOTICE 'PROBLEMA: Trigger nao esta funcionando como esperado';
    END IF;
    RAISE NOTICE '================================================';
END $$;
