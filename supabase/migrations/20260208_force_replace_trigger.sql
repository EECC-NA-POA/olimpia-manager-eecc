-- DIAGNÓSTICO PROFUNDO: LISTAR E FORÇAR SUBSTITUIÇÃO DA TRIGGER
-- 1. Vamos primeiro ver o que tem no banco (para o log do Supabase)
DO $$
DECLARE
    t_name text;
BEGIN
    FOR t_name IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'users' 
        AND event_object_schema = 'auth'
    LOOP
        RAISE NOTICE 'Trigger encontrada em auth.users: %', t_name;
    END LOOP;
END $$;

-- 2. DERRUBAR TUDO QUE TIVER LÁ (Para garantir que só a nossa roda)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_v2 ON auth.users;
-- Adicione outros nomes se houver suspeita, mas o comando acima deve limpar o padrão.

-- 3. RECRIAR A FUNÇÃO (Igual à "Explosiva", mas garantindo replace)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
    metadata_json jsonb;
    _filial_id_raw text;
    _filial_id uuid;
    _data_nascimento date;
BEGIN
    metadata_json := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    _filial_id_raw := metadata_json->>'filial_id';

    -- LOG NO SERVIDOR (Para vermos no dashboard do Supabase também)
    RAISE LOG '🔥 TRIGGER DISPARADA! Email: %, Metadata: %', NEW.email, metadata_json;

    -- 1. VERIFICAÇÃO DE DADOS RECEBIDOS
    IF _filial_id_raw IS NULL OR _filial_id_raw = '' THEN
        RAISE EXCEPTION '❌ ERRO DE DADOS NO FRONTEND: Filial vazia! Metadata recebido: %', metadata_json;
    END IF;

    -- Tentar converter UUID
    BEGIN
        _filial_id := _filial_id_raw::uuid;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION '❌ ERRO DE FORMATO UUID: O valor "%" não é um UUID válido! Metadata: %', _filial_id_raw, metadata_json;
    END;

    -- Converter data
    BEGIN
        IF metadata_json->>'data_nascimento' IS NOT NULL AND metadata_json->>'data_nascimento' != '' THEN
            _data_nascimento := (metadata_json->>'data_nascimento')::date;
        ELSE
            _data_nascimento := NULL;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION '❌ ERRO DE DATA: Data inválida! Metadata: %', metadata_json;
    END;

    -- 2. TENTAR INSERÇÃO
    INSERT INTO public.usuarios (
        id, email, nome_completo, telefone, ddi, 
        tipo_documento, numero_documento, genero, data_nascimento, 
        estado, pais, filial_id, data_criacao, confirmado, ativo
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
        NOW(), true, true
    )
    ON CONFLICT (id) DO UPDATE SET
        nome_completo = EXCLUDED.nome_completo;
        
    -- Papel
    INSERT INTO public.papeis_usuarios (usuario_id, perfil_id)
    SELECT NEW.id, id FROM public.perfis WHERE codigo = 'ATL' LIMIT 1
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- 4. READICIONAR A TRIGGER
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

DO $$
BEGIN
    RAISE NOTICE '✅ Trigger recriada com sucesso. Agora o erro DEVE mudar.';
END $$;
