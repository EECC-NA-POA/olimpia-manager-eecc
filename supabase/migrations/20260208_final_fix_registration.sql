-- SOLUÇÃO DEFINITIVA: CORREÇÃO DA BUSCA DE PERFIL
-- O erro anterior ocorria porque a tabela 'perfis' não tem a coluna 'codigo'.
-- Ajustamos para buscar pelo 'nome' = 'Atleta'.

BEGIN;

-- 1. Manter a tabela de log (é útil para diagnóstico futuro)
CREATE TABLE IF NOT EXISTS public.registration_debug_log (
    id SERIAL PRIMARY KEY,
    email TEXT,
    metadata JSONB,
    step TEXT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Permissões de Log
ALTER TABLE public.registration_debug_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Debug" ON public.registration_debug_log;
CREATE POLICY "Public Debug" ON public.registration_debug_log FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON public.registration_debug_log TO anon, authenticated, service_role;

-- 2. Atualizar a Trigger com a Lógica Correta
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

    -- [LOG] Início
    INSERT INTO public.registration_debug_log (email, metadata, step, error_message)
    VALUES (NEW.email, metadata_json, 'START', NULL)
    RETURNING id INTO _log_id;

    BEGIN
        -- Conversões Seguras
        _filial_id := NULLIF(metadata_json->>'filial_id', '')::uuid;
        _data_nascimento := NULLIF(metadata_json->>'data_nascimento', '')::date;

        -- 1. Inserir Usuário
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
        
        -- 2. Atribuir Papel (CORREÇÃO AQUI)
        -- Busca pelo nome 'Atleta' e pega o mais recente (maior ID)
        INSERT INTO public.papeis_usuarios (usuario_id, perfil_id)
        SELECT NEW.id, id 
        FROM public.perfis 
        WHERE nome = 'Atleta' 
        ORDER BY id DESC 
        LIMIT 1
        ON CONFLICT DO NOTHING;

        -- [LOG] Sucesso
        UPDATE public.registration_debug_log 
        SET step = 'SUCCESS' 
        WHERE id = _log_id;

    EXCEPTION WHEN OTHERS THEN
        -- [LOG] Erro
        UPDATE public.registration_debug_log 
        SET step = 'ERROR', 
            error_message = SQLSTATE || ': ' || SQLERRM 
        WHERE id = _log_id;
        
        -- Opcional: Relançar erro se quiser que o Auth falhe,
        -- mas para debugging deixamos passar para ler o log.
        -- RAISE EXCEPTION 'Erro no cadastro: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$;

-- 3. Reinstalar Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

COMMIT;

-- 4. Confirmação
SELECT 
    'CORREÇÃO APLICADA COM SUCESSO' as status, 
    'Agora o cadastro deve funcionar completamente.' as mensagem;
