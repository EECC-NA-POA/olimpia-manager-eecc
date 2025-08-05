-- Fix RLS policies for modalidade_representantes table
-- This script creates the missing RLS policies that are causing the insert error

-- Enable RLS on modalidade_representantes table (if not already enabled)
ALTER TABLE public.modalidade_representantes ENABLE ROW LEVEL SECURITY;

-- Create function to check delegation representative permissions
CREATE OR REPLACE FUNCTION public.verificar_permissao_delegacao(
  filial_id_param uuid,
  evento_id_param uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  has_permission boolean := false;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user has 'Representante de Delegação' or 'Administração' role for this event
  SELECT EXISTS (
    SELECT 1 
    FROM papeis_usuarios pu
    JOIN perfis p ON p.id = pu.perfil_id
    JOIN usuarios u ON u.id = pu.usuario_id
    WHERE pu.usuario_id = user_id
      AND pu.evento_id = evento_id_param
      AND p.nome IN ('Representante de Delegação', 'Administração')
      AND (p.nome = 'Administração' OR u.filial_id = filial_id_param)
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.verificar_permissao_delegacao(uuid, uuid) TO authenticated;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "modalidade_representantes_select_policy" ON public.modalidade_representantes;
DROP POLICY IF EXISTS "modalidade_representantes_insert_policy" ON public.modalidade_representantes;
DROP POLICY IF EXISTS "modalidade_representantes_delete_policy" ON public.modalidade_representantes;
DROP POLICY IF EXISTS "modalidade_representantes_update_policy" ON public.modalidade_representantes;

-- SELECT Policy: Allow users to see representatives of their filial or modalities where they are monitors
CREATE POLICY "modalidade_representantes_select_policy" ON public.modalidade_representantes
  FOR SELECT
  TO public
  USING (
    -- User can see representatives if they are:
    -- 1. The representative themselves
    atleta_id = auth.uid()
    OR
    -- 2. Admin for the event
    EXISTS (
      SELECT 1 
      FROM papeis_usuarios pu
      JOIN perfis p ON p.id = pu.perfil_id
      JOIN modalidades m ON m.id = modalidade_representantes.modalidade_id
      WHERE pu.usuario_id = auth.uid()
        AND pu.evento_id = m.evento_id
        AND p.nome = 'Administração'
    )
    OR
    -- 3. Delegation representative from same filial
    EXISTS (
      SELECT 1 
      FROM papeis_usuarios pu
      JOIN perfis p ON p.id = pu.perfil_id
      JOIN usuarios u ON u.id = pu.usuario_id
      JOIN modalidades m ON m.id = modalidade_representantes.modalidade_id
      WHERE pu.usuario_id = auth.uid()
        AND pu.evento_id = m.evento_id
        AND p.nome = 'Representante de Delegação'
        AND u.filial_id = modalidade_representantes.filial_id
    )
    OR
    -- 4. Monitor of the modality
    EXISTS (
      SELECT 1 
      FROM papeis_usuarios pu
      JOIN perfis p ON p.id = pu.perfil_id
      JOIN modalidades m ON m.id = modalidade_representantes.modalidade_id
      WHERE pu.usuario_id = auth.uid()
        AND pu.evento_id = m.evento_id
        AND p.nome = 'Monitor'
    )
  );

-- INSERT Policy: Allow delegation representatives and admins to add representatives for their filials
CREATE POLICY "modalidade_representantes_insert_policy" ON public.modalidade_representantes
  FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM modalidades m
      WHERE m.id = modalidade_representantes.modalidade_id
        AND verificar_permissao_delegacao(modalidade_representantes.filial_id, m.evento_id)
    )
  );

-- DELETE Policy: Allow delegation representatives and admins to remove representatives from their filials
CREATE POLICY "modalidade_representantes_delete_policy" ON public.modalidade_representantes
  FOR DELETE
  TO public
  USING (
    EXISTS (
      SELECT 1 
      FROM modalidades m
      WHERE m.id = modalidade_representantes.modalidade_id
        AND verificar_permissao_delegacao(modalidade_representantes.filial_id, m.evento_id)
    )
  );

-- UPDATE Policy: Allow delegation representatives and admins to update representatives from their filials
CREATE POLICY "modalidade_representantes_update_policy" ON public.modalidade_representantes
  FOR UPDATE
  TO public
  USING (
    EXISTS (
      SELECT 1 
      FROM modalidades m
      WHERE m.id = modalidade_representantes.modalidade_id
        AND verificar_permissao_delegacao(modalidade_representantes.filial_id, m.evento_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM modalidades m
      WHERE m.id = modalidade_representantes.modalidade_id
        AND verificar_permissao_delegacao(modalidade_representantes.filial_id, m.evento_id)
    )
  );

-- Verify that RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'modalidade_representantes' AND schemaname = 'public';

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'modalidade_representantes' AND schemaname = 'public';