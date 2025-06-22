
-- Remover trigger e função existentes se houver
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Recriar a função com melhor tratamento de erros
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    user_data RECORD;
BEGIN
    -- Log detalhado para debug
    RAISE NOTICE 'Trigger executada para usuário: % com ID: %', NEW.email, NEW.id;
    RAISE NOTICE 'Metadados recebidos: %', NEW.raw_user_meta_data;
    
    -- Verificar se o usuário já existe na tabela pública
    SELECT * INTO user_data FROM public.usuarios WHERE id = NEW.id;
    
    IF FOUND THEN
        RAISE NOTICE 'Usuário % já existe na tabela pública', NEW.email;
        RETURN NEW;
    END IF;
    
    -- Inserir usuário na tabela pública com valores padrão seguros
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
    )
    VALUES (
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
    
    RAISE NOTICE 'Usuário % inserido com sucesso na tabela pública', NEW.email;
    
    -- Tentar criar papel de atleta por padrão
    BEGIN
        INSERT INTO public.papeis_usuarios (usuario_id, perfil_id)
        SELECT NEW.id, id 
        FROM public.perfis 
        WHERE codigo = 'ATL' OR nome ILIKE '%atleta%' 
        LIMIT 1
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Papel de atleta atribuído para usuário %', NEW.email;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao atribuir papel para usuário %: %', NEW.email, SQLERRM;
    END;
    
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    -- Log do erro mas não falha a criação do usuário no auth
    RAISE NOTICE 'ERRO na trigger para usuário %: %', NEW.email, SQLERRM;
    RAISE NOTICE 'SQLSTATE: %', SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar a trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- Garantir permissões
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

-- Garantir que a política RLS permite inserção
DROP POLICY IF EXISTS "Allow trigger insert" ON public.usuarios;
CREATE POLICY "Allow trigger insert" 
    ON public.usuarios 
    FOR INSERT 
    WITH CHECK (true);

-- Comentário
COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger function para processar novos usuários - versão corrigida com logs detalhados';

-- Testar a trigger com um usuário de exemplo
DO $$
BEGIN
    RAISE NOTICE 'Trigger e função recriadas com sucesso!';
    RAISE NOTICE 'Para testar, insira um usuário em auth.users e verifique se aparece em public.usuarios';
END $$;
