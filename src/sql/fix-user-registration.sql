-- SQL para corrigir o sistema de cadastro de usuários
-- Execute estes comandos no SQL Editor do Supabase na ordem apresentada

-- 1. Verificar se o trigger existe e funciona
SELECT EXISTS (
  SELECT 1 FROM information_schema.triggers 
  WHERE trigger_name = 'on_auth_user_created'
);

-- 2. Recriar a função do trigger com melhor tratamento de erros
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_metadata jsonb;
BEGIN
  -- Log da execução do trigger
  RAISE LOG 'Trigger handle_new_user executado para usuário: %', NEW.id;
  
  -- Extrair metadados do usuário
  user_metadata := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  
  -- Log dos metadados recebidos
  RAISE LOG 'Metadados recebidos: %', user_metadata;
  
  -- Inserir na tabela usuarios com tratamento de erro
  BEGIN
    INSERT INTO public.usuarios (
      id,
      nome_completo,
      email,
      telefone,
      ddi,
      tipo_documento,
      numero_documento,
      genero,
      data_nascimento,
      estado,
      filial_id,
      confirmado,
      ativo,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      COALESCE(user_metadata->>'nome_completo', user_metadata->>'nome', 'Nome não informado'),
      COALESCE(NEW.email, ''),
      COALESCE(user_metadata->>'telefone', ''),
      COALESCE(user_metadata->>'ddi', '+55'),
      COALESCE(user_metadata->>'tipo_documento', 'CPF'),
      COALESCE(user_metadata->>'numero_documento', ''),
      COALESCE(user_metadata->>'genero', 'Masculino'),
      COALESCE(user_metadata->>'data_nascimento', '1990-01-01')::date,
      COALESCE(user_metadata->>'estado', user_metadata->>'state', ''),
      CASE 
        WHEN user_metadata->>'filial_id' IS NOT NULL AND user_metadata->>'filial_id' != '' 
        THEN (user_metadata->>'filial_id')::uuid 
        WHEN user_metadata->>'branchId' IS NOT NULL AND user_metadata->>'branchId' != '' 
        THEN (user_metadata->>'branchId')::uuid 
        ELSE NULL 
      END,
      false,
      true,
      NOW(),
      NOW()
    );
    
    RAISE LOG 'Usuário inserido com sucesso na tabela usuarios: %', NEW.id;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Erro ao inserir usuário na tabela usuarios: % - %', SQLSTATE, SQLERRM;
    -- Não fazemos RAISE aqui para não impedir o cadastro no auth
  END;
  
  -- Inserir papel padrão (ATL - Atleta)
  BEGIN
    INSERT INTO public.usuario_papel_evento (
      usuario_id,
      papel,
      evento_id,
      created_at
    ) VALUES (
      NEW.id,
      'ATL',
      NULL,
      NOW()
    );
    
    RAISE LOG 'Papel ATL atribuído com sucesso para usuário: %', NEW.id;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Erro ao atribuir papel ATL: % - %', SQLSTATE, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Verificar e corrigir políticas RLS na tabela usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "Users can read own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.usuarios;
DROP POLICY IF EXISTS "Allow public insert during registration" ON public.usuarios;

-- Criar política para permitir inserção durante cadastro
CREATE POLICY "Allow insert during registration" ON public.usuarios
FOR INSERT WITH CHECK (true);

-- Criar política para leitura do próprio perfil
CREATE POLICY "Users can read own profile" ON public.usuarios
FOR SELECT USING (auth.uid() = id);

-- Criar política para atualização do próprio perfil
CREATE POLICY "Users can update own profile" ON public.usuarios
FOR UPDATE USING (auth.uid() = id);

-- 5. Verificar políticas na tabela usuario_papel_evento
ALTER TABLE public.usuario_papel_evento ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert during registration" ON public.usuario_papel_evento;
CREATE POLICY "Allow insert during registration" ON public.usuario_papel_evento
FOR INSERT WITH CHECK (true);

-- 6. Dar permissões adequadas
GRANT INSERT, SELECT, UPDATE ON public.usuarios TO authenticated;
GRANT INSERT, SELECT ON public.usuario_papel_evento TO authenticated;

-- 7. Verificar se as tabelas têm os campos necessários
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'usuarios' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. Testar a função do trigger manualmente (opcional)
-- SELECT public.handle_new_user();