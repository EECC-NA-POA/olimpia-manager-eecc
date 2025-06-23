
-- Fix RLS policies for perfis table to allow trigger function to work

-- First, let's check if there are existing policies and drop them if needed
DROP POLICY IF EXISTS perfis_select_policy ON public.perfis;
DROP POLICY IF EXISTS perfis_insert_policy ON public.perfis;
DROP POLICY IF EXISTS perfis_update_policy ON public.perfis;
DROP POLICY IF EXISTS perfis_delete_policy ON public.perfis;

-- Create new policies that allow the trigger function to work
-- Policy for SELECT: Users can see profiles from events they have access to
CREATE POLICY perfis_select_policy
  ON public.perfis
  FOR SELECT
  USING (
    -- Allow if user has a role in this event
    EXISTS (
      SELECT 1 FROM public.papeis_usuarios pu
      WHERE pu.evento_id = perfis.evento_id
      AND pu.usuario_id = auth.uid()
    )
    OR
    -- Allow if this is a system operation (trigger context)
    current_setting('role') = 'service_role'
  );

-- Policy for INSERT: Allow system operations and specific user operations
CREATE POLICY perfis_insert_policy
  ON public.perfis
  FOR INSERT
  WITH CHECK (
    -- Allow system operations (triggers, service role)
    current_setting('role') = 'service_role'
    OR
    -- Allow if user has admin privileges in the event
    EXISTS (
      SELECT 1 FROM public.papeis_usuarios pu
      JOIN public.perfis p ON p.id = pu.perfil_id
      JOIN public.perfis_tipo pt ON pt.id = p.perfil_tipo_id
      WHERE pu.evento_id = perfis.evento_id
      AND pu.usuario_id = auth.uid()
      AND pt.codigo = 'ADM'
    )
  );

-- Policy for UPDATE: Similar to insert
CREATE POLICY perfis_update_policy
  ON public.perfis
  FOR UPDATE
  USING (
    current_setting('role') = 'service_role'
    OR
    EXISTS (
      SELECT 1 FROM public.papeis_usuarios pu
      JOIN public.perfis p ON p.id = pu.perfil_id
      JOIN public.perfis_tipo pt ON pt.id = p.perfil_tipo_id
      WHERE pu.evento_id = perfis.evento_id
      AND pu.usuario_id = auth.uid()
      AND pt.codigo = 'ADM'
    )
  )
  WITH CHECK (
    current_setting('role') = 'service_role'
    OR
    EXISTS (
      SELECT 1 FROM public.papeis_usuarios pu
      JOIN public.perfis p ON p.id = pu.perfil_id
      JOIN public.perfis_tipo pt ON pt.id = p.perfil_tipo_id
      WHERE pu.evento_id = perfis.evento_id
      AND pu.usuario_id = auth.uid()
      AND pt.codigo = 'ADM'
    )
  );

-- Policy for DELETE: Similar to update
CREATE POLICY perfis_delete_policy
  ON public.perfis
  FOR DELETE
  USING (
    current_setting('role') = 'service_role'
    OR
    EXISTS (
      SELECT 1 FROM public.papeis_usuarios pu
      JOIN public.perfis p ON p.id = pu.perfil_id
      JOIN public.perfis_tipo pt ON pt.id = p.perfil_tipo_id
      WHERE pu.evento_id = perfis.evento_id
      AND pu.usuario_id = auth.uid()
      AND pt.codigo = 'ADM'
    )
  );

-- Ensure the trigger function has the right security context
CREATE OR REPLACE FUNCTION public.ensure_default_roles()
RETURNS TRIGGER AS $$
BEGIN
    -- Set the role context to allow RLS bypass for this operation
    PERFORM set_config('role', 'service_role', true);
    
    -- Create default profiles for the new event
    INSERT INTO public.perfis (nome, descricao, evento_id, perfil_tipo_id)
    VALUES 
        ('Atleta', 'Perfil padrão para atletas', NEW.id, '7b46a728-348b-46ba-9233-55cb03e73987'),
        ('Juiz', 'Perfil padrão para juízes', NEW.id, 'c8b6adfc-dca6-41fb-bf1d-391413462c61'),
        ('Administração', 'Acesso administrativo ao evento', NEW.id, '0b0e3eec-9191-4703-a709-4a88dbd537b0')
    ON CONFLICT (nome, evento_id) DO NOTHING;
    
    -- Reset the role context
    PERFORM set_config('role', 'authenticated', true);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger is still active
DROP TRIGGER IF EXISTS ensure_default_roles_trigger ON public.eventos;
CREATE TRIGGER ensure_default_roles_trigger
    AFTER INSERT ON public.eventos
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_default_roles();

-- Grant necessary permissions
GRANT ALL ON TABLE public.perfis TO service_role;
GRANT EXECUTE ON FUNCTION public.ensure_default_roles() TO authenticated;
