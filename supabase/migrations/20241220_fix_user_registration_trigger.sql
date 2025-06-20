
-- Função para processar novos usuários automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Log para debug
  RAISE LOG 'Processing new user: % with metadata: %', NEW.email, NEW.raw_user_meta_data;
  
  -- Inserir usuário na tabela pública
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
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', ''),
    COALESCE(NEW.raw_user_meta_data->>'telefone', ''),
    COALESCE(NEW.raw_user_meta_data->>'ddi', '+55'),
    COALESCE(NEW.raw_user_meta_data->>'tipo_documento', 'CPF'),
    COALESCE(NEW.raw_user_meta_data->>'numero_documento', ''),
    COALESCE(NEW.raw_user_meta_data->>'genero', ''),
    CASE 
      WHEN NEW.raw_user_meta_data->>'data_nascimento' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'data_nascimento')::date 
      ELSE NULL 
    END,
    COALESCE(NEW.raw_user_meta_data->>'estado', ''),
    COALESCE(NEW.raw_user_meta_data->>'filial_id', ''),
    NOW(),
    NEW.email_confirmed_at IS NOT NULL
  );
  
  -- Criar papel de atleta por padrão se existe o perfil
  INSERT INTO public.papeis_usuarios (usuario_id, perfil_id)
  SELECT NEW.id, id 
  FROM public.perfis 
  WHERE codigo = 'ATL' OR nome ILIKE '%atleta%' 
  LIMIT 1
  ON CONFLICT DO NOTHING;
  
  RAISE LOG 'User % processed successfully', NEW.email;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log do erro mas não falha a criação do usuário no auth
  RAISE LOG 'Error processing new user %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger que executa a função quando um usuário é criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Garantir que a função tenha as permissões necessárias
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- Política RLS para permitir inserção automática via trigger
-- Remover política existente se houver
DROP POLICY IF EXISTS "Allow trigger insert" ON public.usuarios;

-- Criar política que permite inserção via trigger
CREATE POLICY "Allow trigger insert" 
ON public.usuarios 
FOR INSERT 
WITH CHECK (true);

-- Comentário explicativo
COMMENT ON FUNCTION public.handle_new_user() IS 'Processa automaticamente novos usuários criados via Supabase Auth, criando registro na tabela usuarios e atribuindo papel padrão';
