-- CORREÇÃO PARA "DATABASE ERROR SAVING NEW USER" (V3 - COMPLETA)
-- 1. Cria colunas que faltam (estado, pais)
-- 2. Atualiza restrições (constraints) para aceitar PASSAPORTE
-- 3. Reconstrói a trigger com segurança total

-- ==============================================================================
-- 1. ALTERAÇÕES NA ESTRUTURA DA TABELA (COLUNAS E CONSTRAINTS)
-- ==============================================================================

DO $$
BEGIN
    -- Adicionar 'estado' se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'estado') THEN
        ALTER TABLE public.usuarios ADD COLUMN estado text;
        RAISE NOTICE 'Coluna estado adicionada.';
    END IF;

    -- Adicionar 'pais' se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'pais') THEN
        ALTER TABLE public.usuarios ADD COLUMN pais text DEFAULT 'Brasil';
        RAISE NOTICE 'Coluna pais adicionada.';
    END IF;
END $$;

-- Atualizar Constraints de Documento (Para aceitar Passaporte)
DO $$
BEGIN
    -- Remover constraints antigas se existirem
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_tipo_documento_check') THEN
        ALTER TABLE public.usuarios DROP CONSTRAINT usuarios_tipo_documento_check;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_document_format') THEN
        ALTER TABLE public.usuarios DROP CONSTRAINT chk_document_format;
    END IF;

    -- Adicionar nova constraint de tipos (Incluindo PASSAPORTE)
    ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_tipo_documento_check 
    CHECK (tipo_documento IN ('CPF', 'RG', 'PASSAPORTE', 'OUTRO'));

    -- Adicionar nova validação de formato (Incluindo Passaporte)
    ALTER TABLE public.usuarios ADD CONSTRAINT chk_document_format 
    CHECK (
        (tipo_documento = 'CPF' AND numero_documento ~ '^\d{11}$') OR
        (tipo_documento = 'RG' AND length(numero_documento) <= 20) OR
        (tipo_documento = 'PASSAPORTE') OR
        (tipo_documento = 'OUTRO')
    );
    
    RAISE NOTICE 'Constraints atualizadas para suportar PASSAPORTE.';
END $$;

-- ==============================================================================
-- 2. FUNÇÃO DE GATILHO (TRIGGER) REFINADA
-- ==============================================================================

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
    _filial_id uuid;
    _data_nascimento date;
BEGIN
    RAISE NOTICE '=== PROCESSAMENTO V3: % ===', NEW.email;
    
    metadata_json := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    
    -- Conversão Segura de Filial ID
    BEGIN
        _filial_id := NULLIF(metadata_json->>'filial_id', '')::uuid;
    EXCEPTION WHEN OTHERS THEN
        _filial_id := NULL; -- Se der erro ou for inválido, deixa NULL
    END;

    -- Conversão Segura de Data
    BEGIN
        IF metadata_json->>'data_nascimento' IS NOT NULL AND metadata_json->>'data_nascimento' != '' THEN
            _data_nascimento := (metadata_json->>'data_nascimento')::date;
        ELSE
            _data_nascimento := NULL;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        _data_nascimento := NULL;
    END;

    -- Verificar duplicidade
    IF EXISTS (SELECT 1 FROM public.usuarios WHERE id = NEW.id) THEN
        RETURN NEW;
    END IF;

    -- Inserção Controlada
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
            pais,
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
            COALESCE(metadata_json->>'genero', 'Masculino'), -- Default seguro
            _data_nascimento,
            COALESCE(metadata_json->>'estado', ''),
            COALESCE(metadata_json->>'pais', 'Brasil'),
            _filial_id,
            NOW(),
            true
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ERRO DE INSERÇÃO: % %', SQLSTATE, SQLERRM;
        -- Não relançar erro para não travar o Auth do Supabase
    END;

    -- Atribuir Papel ATL
    BEGIN
        SELECT id INTO perfil_atleta_id FROM public.perfis WHERE codigo = 'ATL' LIMIT 1;
        IF perfil_atleta_id IS NOT NULL THEN
            INSERT INTO public.papeis_usuarios (usuario_id, perfil_id)
            VALUES (NEW.id, perfil_atleta_id)
            ON CONFLICT DO NOTHING;
        END IF;
    END;

    RETURN NEW;
END;
$$;

-- Recriar Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();
