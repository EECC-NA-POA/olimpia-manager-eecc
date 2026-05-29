-- DIAGNÓSTICO FINAL: TRIGGER ESPIÃO (EXPLOSIVA)
-- Objetivo: Se o cadastro falhar, MOSTRAR O JSON EXATO que o App enviou.
-- Isso vai nos provar se o App está enviando a filial certa ou não.

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

    -- 1. VERIFICAÇÃO DE DADOS RECEBIDOS
    -- Se filial vier vazia, vamos EXPLODIR o erro para ver o JSON
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

    -- 2. TENTAR INSERÇÃO (SEM SILENCIADOR)
    -- Se der erro aqui, é erro de banco (ex: ID da filial não existe na tabela filiais)
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
        _filial_id, -- AQUI ESTÁ A FILIAL VALIDADA
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
