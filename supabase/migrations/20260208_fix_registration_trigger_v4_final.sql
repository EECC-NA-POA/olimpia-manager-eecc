-- CORREÇÃO DEFINITIVA V4 (NON-BLOCKING)
-- Objetivo: Restaurar a criação do perfil público, mas SEMPRE permitir o cadastro no Auth.
-- Se houver erro na trigger, o usuário é criado no Auth igual, e logamos o erro.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
    metadata_json jsonb;
    _filial_id uuid;
    _data_nascimento date;
BEGIN
    -- Bloco principal protegido
    BEGIN
        RAISE NOTICE '=== PROCESSANDO NOVO USUÁRIO (V4) ===';
        RAISE NOTICE 'Email: %', NEW.email;
        
        metadata_json := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
        
        -- 1. Tratamento de UUID (falha silenciosa -> NULL)
        BEGIN
            _filial_id := NULLIF(metadata_json->>'filial_id', '')::uuid;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Filial ID inválido: %', metadata_json->>'filial_id';
            _filial_id := NULL;
        END;

        -- 2. Tratamento de Data (falha silenciosa -> NULL)
        BEGIN
            IF metadata_json->>'data_nascimento' IS NOT NULL AND metadata_json->>'data_nascimento' != '' THEN
                _data_nascimento := (metadata_json->>'data_nascimento')::date;
            ELSE
                _data_nascimento := NULL;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Data nascimento inválida: %', metadata_json->>'data_nascimento';
            _data_nascimento := NULL;
        END;

        -- 3. Inserção na tabela pública (public.usuarios)
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
            confirmado,
            ativo
        ) VALUES (
            NEW.id,
            COALESCE(NEW.email, ''),
            COALESCE(metadata_json->>'nome_completo', ''),
            COALESCE(metadata_json->>'telefone', ''),
            COALESCE(metadata_json->>'ddi', '+55'),
            COALESCE(metadata_json->>'tipo_documento', 'CPF'),
            COALESCE(metadata_json->>'numero_documento', ''),
            COALESCE(metadata_json->>'genero', 'Masculino'),
            _data_nascimento,
            COALESCE(metadata_json->>'estado', ''),
            COALESCE(metadata_json->>'pais', 'Brasil'),
            _filial_id,
            NOW(),
            true, -- Confirmado
            true  -- Ativo
        )
        ON CONFLICT (id) DO UPDATE SET
            nome_completo = EXCLUDED.nome_completo,
            email = EXCLUDED.email,
            filial_id = EXCLUDED.filial_id; -- Atualiza se já existir

        -- 4. Atribuir Perfil (atleta/ATL)
        BEGIN
            INSERT INTO public.papeis_usuarios (usuario_id, perfil_id)
            SELECT NEW.id, id FROM public.perfis WHERE codigo = 'ATL' LIMIT 1
            ON CONFLICT DO NOTHING;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Erro ao atribuir papel: %', SQLERRM;
        END;

        RAISE NOTICE '✅ Sucesso total para %', NEW.email;
        
    EXCEPTION WHEN OTHERS THEN
        -- CATCH-ALL: Se qualquer coisa falhar acima, loga e SEGUE O BAILE
        RAISE NOTICE '❌ ERRO NA TRIGGER (mas ignorado para permitir cadastro): %', SQLERRM;
    END;

    -- SEMPRE retorna NEW para permitir que o Supabase Auth crie o usuário
    RETURN NEW;
END;
$$;

-- Recriar a Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();
