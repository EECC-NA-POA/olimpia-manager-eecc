-- SCRIPT DE INSTALAÇÃO DO LOG "CAIXA PRETA" (RETORNA CONFIRMAÇÃO VISUAL)
-- Este script APAGA triggers antigas, cria a tabela de log e instala a trigger segura.

BEGIN;

-- 1. Criar tabela de Log que sobrevive a tudo
CREATE TABLE IF NOT EXISTS public.registration_debug_log (
    id SERIAL PRIMARY KEY,
    email TEXT,
    metadata JSONB,
    step TEXT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Liberar acesso
ALTER TABLE public.registration_debug_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Debug" ON public.registration_debug_log;
CREATE POLICY "Public Debug" ON public.registration_debug_log FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON public.registration_debug_log TO anon, authenticated, service_role;

-- 2. Trigger "Caixa Preta"
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
    _log_id int;
BEGIN
    metadata_json := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);

    -- [LOG 1] Chegada
    INSERT INTO public.registration_debug_log (email, metadata, step, error_message)
    VALUES (NEW.email, metadata_json, 'START', NULL)
    RETURNING id INTO _log_id;

    -- Tentar Inserir
    BEGIN
        _filial_id := NULLIF(metadata_json->>'filial_id', '')::uuid;
        _data_nascimento := NULLIF(metadata_json->>'data_nascimento', '')::date;

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
        );
        
        -- [LOG 2] Sucesso
        UPDATE public.registration_debug_log 
        SET step = 'SUCCESS' 
        WHERE id = _log_id;

        -- Papel
        INSERT INTO public.papeis_usuarios (usuario_id, perfil_id)
        SELECT NEW.id, id FROM public.perfis WHERE codigo = 'ATL' LIMIT 1
        ON CONFLICT DO NOTHING;

    EXCEPTION WHEN OTHERS THEN
        -- [LOG 3] ERRO CAPTURADO
        UPDATE public.registration_debug_log 
        SET step = 'ERROR', 
            error_message = SQLSTATE || ': ' || SQLERRM 
        WHERE id = _log_id;
    END;
    
    RETURN NEW;
END;
$$;

-- 3. Instalar Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

COMMIT;

-- 4. Retorno Visual para o Usuário
SELECT 
    'INSTALAÇÃO CONCLUÍDA' as status, 
    'Agora tente cadastrar no App e depois consulte a tabela registration_debug_log' as instrucao;
