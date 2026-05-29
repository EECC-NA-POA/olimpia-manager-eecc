-- CORREÇÃO ROBUSTA DE PERFIL PÚBLICO (V5)
-- Objetivo: Garantir que o perfil público SEJA CRIADO, seja via Trigger ou via App.

-- 1. Garantir colunas necessárias (além do DDI adicionado antes)
DO $$
BEGIN
    -- DDI
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'ddi') THEN
        ALTER TABLE public.usuarios ADD COLUMN ddi text DEFAULT '+55';
    END IF;
    -- Pais
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'pais') THEN
        ALTER TABLE public.usuarios ADD COLUMN pais text DEFAULT 'Brasil';
    END IF;
    -- Estado
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'estado') THEN
        ALTER TABLE public.usuarios ADD COLUMN estado text;
    END IF;
    -- Filial ID (se não for UUID, converter... mas assumimos que está certo)
END $$;

-- 2. Garantir permissões de RLS (Para caso o App precise inserir manualmente)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Política: Usuário pode inserir SEU PRÓPRIO perfil
DROP POLICY IF EXISTS "Usuários podem criar seu próprio perfil" ON public.usuarios;
CREATE POLICY "Usuários podem criar seu próprio perfil"
    ON public.usuarios
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Política: Usuário pode ver SEU PRÓPRIO perfil
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.usuarios;
CREATE POLICY "Usuários podem ver seu próprio perfil"
    ON public.usuarios
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Política: Usuário pode atualizar SEU PRÓPRIO perfil
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.usuarios;
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
    ON public.usuarios
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- 3. Trigger V4 (Reaplicando para garantir)
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
        metadata_json := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
        
        -- Tratamentos de dados
        BEGIN
            _filial_id := NULLIF(metadata_json->>'filial_id', '')::uuid;
        EXCEPTION WHEN OTHERS THEN _filial_id := NULL; END;

        BEGIN
            If metadata_json->>'data_nascimento' IS NOT NULL AND metadata_json->>'data_nascimento' != '' THEN
                _data_nascimento := (metadata_json->>'data_nascimento')::date;
            ELSE
                _data_nascimento := NULL;
            END IF;
        EXCEPTION WHEN OTHERS THEN _data_nascimento := NULL; END;

        -- Inserção
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
        
    EXCEPTION WHEN OTHERS THEN
        -- Logar erro no Postgres (visível no dashboard)
        RAISE WARNING 'Trigger falou para user %: %', NEW.email, SQLERRM;
    END;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

RAISE NOTICE 'Script V5 aplicado com sucesso! RLS configurado e colunas verificadas.';
