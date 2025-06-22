
-- CORREÇÃO DEFINITIVA PARA REGISTRO DE USUÁRIOS
-- Corrige problemas de conexão e trigger

-- ============================================
-- 1. VERIFICAR CONFIGURAÇÃO DO SUPABASE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '=== DIAGNÓSTICO INICIAL ===';
    RAISE NOTICE 'Verificando estrutura das tabelas...';
END $$;

-- Verificar se as tabelas existem
DO $$
DECLARE
    auth_users_exists boolean := false;
    public_usuarios_exists boolean := false;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'auth' AND table_name = 'users'
    ) INTO auth_users_exists;
    
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'usuarios'
    ) INTO public_usuarios_exists;
    
    RAISE NOTICE 'Tabela auth.users existe: %', auth_users_exists;
    RAISE NOTICE 'Tabela public.usuarios existe: %', public_usuarios_exists;
    
    IF NOT auth_users_exists THEN
        RAISE EXCEPTION 'Tabela auth.users não encontrada - problema na configuração do Supabase';
    END IF;
    
    IF NOT public_usuarios_exists THEN
        RAISE EXCEPTION 'Tabela public.usuarios não encontrada - execute as migrações básicas primeiro';
    END IF;
END $$;

-- ============================================
-- 2. LIMPAR E RECRIAR TRIGGER
-- ============================================

-- Remover trigger e função existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Criar função de trigger robusta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
    user_exists boolean := false;
    perfil_atleta_id uuid;
    metadata_json jsonb;
BEGIN
    -- Log detalhado
    RAISE NOTICE '=== PROCESSANDO NOVO USUÁRIO ===';
    RAISE NOTICE 'Email: % | ID: %', NEW.email, NEW.id;
    RAISE NOTICE 'Timestamp: %', now();
    
    -- Verificar metadados
    metadata_json := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    RAISE NOTICE 'Metadados recebidos: %', metadata_json;
    
    -- Verificar se usuário já existe
    SELECT EXISTS(SELECT 1 FROM public.usuarios WHERE id = NEW.id) INTO user_exists;
    
    IF user_exists THEN
        RAISE NOTICE 'AVISO: Usuário % já existe na tabela pública', NEW.email;
        RETURN NEW;
    END IF;
    
    -- Inserir na tabela pública com tratamento de erro robusto
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
            COALESCE(metadata_json->>'nome_completo', ''),
            COALESCE(metadata_json->>'telefone', ''),
            COALESCE(metadata_json->>'ddi', '+55'),
            COALESCE(metadata_json->>'tipo_documento', 'CPF'),
            COALESCE(metadata_json->>'numero_documento', ''),
            COALESCE(metadata_json->>'genero', ''),
            CASE 
                WHEN metadata_json->>'data_nascimento' IS NOT NULL 
                    AND metadata_json->>'data_nascimento' != ''
                    AND metadata_json->>'data_nascimento' != 'null'
                THEN (metadata_json->>'data_nascimento')::date 
                ELSE NULL 
            END,
            COALESCE(metadata_json->>'estado', ''),
            COALESCE(metadata_json->>'filial_id', ''),
            NOW(),
            true -- Auto-confirmar para instâncias self-hosted
        );
        
        RAISE NOTICE '✅ SUCESSO: Usuário % inserido na tabela pública', NEW.email;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ERRO ao inserir usuário % na tabela pública:', NEW.email;
        RAISE NOTICE 'Erro: %', SQLERRM;
        RAISE NOTICE 'Estado: %', SQLSTATE;
        
        -- Para instâncias self-hosted, não falhar a criação do usuário
        -- mas registrar o erro para investigação
        RAISE NOTICE 'Continuando apesar do erro para não bloquear auth.users';
    END;
    
    -- Tentar atribuir papel de atleta
    BEGIN
        SELECT id INTO perfil_atleta_id 
        FROM public.perfis 
        WHERE codigo = 'ATL' OR nome ILIKE '%atleta%' 
        LIMIT 1;
        
        IF perfil_atleta_id IS NOT NULL THEN
            INSERT INTO public.papeis_usuarios (usuario_id, perfil_id)
            VALUES (NEW.id, perfil_atleta_id)
            ON CONFLICT DO NOTHING;
            
            RAISE NOTICE '✅ Papel de atleta atribuído para %', NEW.email;
        ELSE
            RAISE NOTICE 'AVISO: Perfil de atleta não encontrado';
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erro ao atribuir papel para %: %', NEW.email, SQLERRM;
    END;
    
    RAISE NOTICE '=== PROCESSAMENTO CONCLUÍDO ===';
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO CRÍTICO na trigger para %: %', NEW.email, SQLERRM;
    -- Não falhar a criação do usuário por causa da trigger
    RETURN NEW;
END;
$$;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. CONFIGURAR PERMISSÕES E RLS
-- ============================================

-- Garantir permissões para a função
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

-- Remover políticas RLS conflitantes
DROP POLICY IF EXISTS "usuarios_insert_policy" ON public.usuarios;
DROP POLICY IF EXISTS "Allow trigger insert" ON public.usuarios;

-- Criar política RLS para permitir inserção via trigger
CREATE POLICY "usuarios_trigger_insert" 
ON public.usuarios 
FOR INSERT 
WITH CHECK (true);

-- ============================================
-- 4. CONFIGURAR AUTO-CONFIRMAÇÃO
-- ============================================

-- Para instâncias Docker self-hosted, as variáveis de ambiente devem ser:
-- GOTRUE_MAILER_AUTOCONFIRM=true
-- GOTRUE_DISABLE_SIGNUP=false

DO $$
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE 'CONFIGURAÇÃO COMPLETA!';
    RAISE NOTICE '';
    RAISE NOTICE 'Para instâncias Docker auto-hospedadas, adicione:';
    RAISE NOTICE 'GOTRUE_MAILER_AUTOCONFIRM=true';
    RAISE NOTICE 'GOTRUE_DISABLE_SIGNUP=false';
    RAISE NOTICE '';
    RAISE NOTICE 'Reinicie o container após adicionar as variáveis.';
    RAISE NOTICE 'Teste o cadastro na aplicação agora!';
    RAISE NOTICE '================================================';
END $$;

-- ============================================
-- 5. TESTE AUTOMÁTICO
-- ============================================

-- Limpar usuário de teste
DELETE FROM auth.users WHERE email = 'teste-correcao@exemplo.com';
DELETE FROM public.usuarios WHERE email = 'teste-correcao@exemplo.com';

-- Inserir usuário de teste
DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
    auth_count integer;
    public_count integer;
BEGIN
    RAISE NOTICE 'Executando teste de criação de usuário...';
    
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
        'teste-correcao@exemplo.com',
        crypt('123456', gen_salt('bf')),
        now(),
        now(),
        now(),
        '',
        '{"nome_completo": "Teste Correção", "telefone": "11999999999", "estado": "SP", "filial_id": "teste-filial"}'::jsonb
    );
    
    -- Aguardar processamento
    PERFORM pg_sleep(2);
    
    -- Verificar resultado
    SELECT COUNT(*) INTO auth_count FROM auth.users WHERE email = 'teste-correcao@exemplo.com';
    SELECT COUNT(*) INTO public_count FROM public.usuarios WHERE email = 'teste-correcao@exemplo.com';
    
    RAISE NOTICE '=== RESULTADO DO TESTE ===';
    RAISE NOTICE 'Usuários em auth.users: %', auth_count;
    RAISE NOTICE 'Usuários em public.usuarios: %', public_count;
    
    IF auth_count = 1 AND public_count = 1 THEN
        RAISE NOTICE '✅ SUCESSO: Sistema funcionando corretamente!';
    ELSE
        RAISE NOTICE '❌ PROBLEMA: Trigger não está funcionando como esperado';
        RAISE NOTICE 'Verifique os logs acima para mais detalhes';
    END IF;
END $$;
