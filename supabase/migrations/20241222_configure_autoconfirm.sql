
-- CONFIGURAR AUTO-CONFIRMAÇÃO PARA INSTÂNCIAS AUTO-HOSPEDADAS
-- Execute este SQL para eliminar a necessidade de confirmação por email

-- ============================================
-- 1. CONFIGURAR AUTO-CONFIRMAÇÃO VIA SQL
-- ============================================

-- Para Supabase auto-hospedado, definir configuração de auto-confirmação
-- Isso elimina a necessidade de confirmação por email

-- Verificar se existe tabela de configuração
DO $$
BEGIN
    -- Tentar inserir configuração de auto-confirmação se não existir
    BEGIN
        -- Para algumas versões do Supabase, isso pode funcionar
        INSERT INTO auth.config (name, value) 
        VALUES ('MAILER_AUTOCONFIRM', 'true')
        ON CONFLICT (name) DO UPDATE SET value = 'true';
        
        RAISE NOTICE 'Configuração MAILER_AUTOCONFIRM definida via SQL';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Não foi possível definir configuração via SQL - use variáveis de ambiente';
    END;
END $$;

-- ============================================
-- 2. MELHORAR A TRIGGER PARA GARANTIR CRIAÇÃO
-- ============================================

-- Recriar a função da trigger com melhor tratamento
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
    user_exists boolean := false;
    perfil_atleta_id uuid;
BEGIN
    -- Log detalhado
    RAISE NOTICE '=== PROCESSANDO NOVO USUÁRIO ===';
    RAISE NOTICE 'Email: % | ID: %', NEW.email, NEW.id;
    RAISE NOTICE 'Metadados: %', NEW.raw_user_meta_data;
    RAISE NOTICE 'Email confirmado: %', NEW.email_confirmed_at;
    
    -- Verificar se usuário já existe
    SELECT EXISTS(SELECT 1 FROM public.usuarios WHERE id = NEW.id) INTO user_exists;
    
    IF user_exists THEN
        RAISE NOTICE 'AVISO: Usuário % já existe na tabela pública', NEW.email;
        RETURN NEW;
    END IF;
    
    -- Inserir na tabela pública
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
            true -- Auto-confirmar para instâncias self-hosted
        );
        
        RAISE NOTICE '✅ SUCESSO: Usuário % inserido na tabela pública', NEW.email;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ERRO ao inserir usuário % na tabela pública: %', NEW.email, SQLERRM;
        -- Não falhar a trigger por causa disso
    END;
    
    -- Atribuir papel de atleta
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
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erro ao atribuir papel para %: %', NEW.email, SQLERRM;
    END;
    
    RAISE NOTICE '=== PROCESSAMENTO CONCLUÍDO ===';
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO CRÍTICO na trigger para %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recriar a trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. INSTRUÇÕES PARA VARIÁVEIS DE AMBIENTE
-- ============================================

-- Para instâncias Docker auto-hospedadas, adicione estas variáveis:
-- GOTRUE_MAILER_AUTOCONFIRM=true
-- GOTRUE_DISABLE_SIGNUP=false
-- GOTRUE_SITE_URL=http://localhost:3000 (ou sua URL)

DO $$
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE 'CONFIGURAÇÃO COMPLETA!';
    RAISE NOTICE '';
    RAISE NOTICE 'Para instâncias Docker, adicione no docker-compose.yml:';
    RAISE NOTICE 'GOTRUE_MAILER_AUTOCONFIRM=true';
    RAISE NOTICE 'GOTRUE_DISABLE_SIGNUP=false';
    RAISE NOTICE '';
    RAISE NOTICE 'Teste agora o cadastro na aplicação!';
    RAISE NOTICE '================================================';
END $$;
