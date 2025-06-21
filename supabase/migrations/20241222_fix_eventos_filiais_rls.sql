
-- Migration to fix RLS policies for eventos_filiais table
-- This addresses the event-branch linking issue

-- Drop existing problematic policies if they exist
DROP POLICY IF EXISTS "eventos_filiais_insert_policy" ON public.eventos_filiais;
DROP POLICY IF EXISTS "eventos_filiais_select_policy" ON public.eventos_filiais;
DROP POLICY IF EXISTS "eventos_filiais_delete_policy" ON public.eventos_filiais;

-- Ensure RLS is enabled
ALTER TABLE public.eventos_filiais ENABLE ROW LEVEL SECURITY;

-- Create permissive INSERT policy for eventos_filiais
CREATE POLICY "eventos_filiais_insert_authenticated" 
ON public.eventos_filiais 
FOR INSERT 
TO authenticated
WITH CHECK (
    -- Allow insert if user can create events or has admin role for the event
    EXISTS (
        SELECT 1 
        FROM public.usuarios u 
        WHERE u.id = auth.uid() 
        AND u.cadastra_eventos = true
    )
    OR EXISTS (
        SELECT 1 
        FROM public.papeis_usuarios pu
        JOIN public.perfis p ON pu.perfil_id = p.id
        WHERE pu.usuario_id = auth.uid() 
        AND pu.evento_id = eventos_filiais.evento_id
        AND p.nome = 'Administração'
    )
    -- Fallback for null auth.uid()
    OR (auth.uid() IS NULL AND auth.role() = 'authenticated')
);

-- Create SELECT policy for eventos_filiais
CREATE POLICY "eventos_filiais_select_authenticated" 
ON public.eventos_filiais 
FOR SELECT 
TO authenticated
USING (
    -- Allow if user can create events or has access to the event
    EXISTS (
        SELECT 1 
        FROM public.usuarios u 
        WHERE u.id = auth.uid() 
        AND u.cadastra_eventos = true
    )
    OR EXISTS (
        SELECT 1 
        FROM public.papeis_usuarios pu 
        WHERE pu.usuario_id = auth.uid() 
        AND pu.evento_id = eventos_filiais.evento_id
    )
    -- Allow if user belongs to the branch
    OR EXISTS (
        SELECT 1 
        FROM public.usuarios u 
        WHERE u.id = auth.uid() 
        AND u.filial_id = eventos_filiais.filial_id
    )
    -- Fallback
    OR auth.uid() IS NULL
);

-- Create DELETE policy for eventos_filiais
CREATE POLICY "eventos_filiais_delete_authenticated" 
ON public.eventos_filiais 
FOR DELETE 
TO authenticated
USING (
    -- Allow delete if user can create events or has admin role for the event
    EXISTS (
        SELECT 1 
        FROM public.usuarios u 
        WHERE u.id = auth.uid() 
        AND u.cadastra_eventos = true
    )
    OR EXISTS (
        SELECT 1 
        FROM public.papeis_usuarios pu
        JOIN public.perfis p ON pu.perfil_id = p.id
        WHERE pu.usuario_id = auth.uid() 
        AND pu.evento_id = eventos_filiais.evento_id
        AND p.nome = 'Administração'
    )
);

-- Add some debugging info
DO $$
BEGIN
    RAISE NOTICE 'Migration completed: RLS policies for eventos_filiais table fixed';
    RAISE NOTICE 'Users with cadastra_eventos = true can now link events to branches';
END $$;
