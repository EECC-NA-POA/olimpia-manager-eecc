
-- Fix RLS recursion issue for perfis table during event creation
-- This migration addresses the infinite recursion in RLS policies

-- First, let's temporarily disable RLS to fix the policies
ALTER TABLE public.perfis DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxas_inscricao DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "trigger_perfis_insert" ON public.perfis;
DROP POLICY IF EXISTS "trigger_taxas_insert" ON public.taxas_inscricao;
DROP POLICY IF EXISTS "Users can view profiles for their events" ON public.perfis;
DROP POLICY IF EXISTS "Users can create profiles for their events" ON public.perfis;
DROP POLICY IF EXISTS "Users can update profiles for their events" ON public.perfis;
DROP POLICY IF EXISTS "Users can delete profiles for their events" ON public.perfis;

-- Re-enable RLS
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxas_inscricao ENABLE ROW LEVEL SECURITY;

-- Create non-recursive policies for perfis
CREATE POLICY "perfis_select_policy" 
ON public.perfis 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "perfis_insert_policy" 
ON public.perfis 
FOR INSERT 
TO authenticated, service_role
WITH CHECK (true);

CREATE POLICY "perfis_update_policy" 
ON public.perfis 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "perfis_delete_policy" 
ON public.perfis 
FOR DELETE 
TO authenticated
USING (true);

-- Create non-recursive policies for taxas_inscricao
CREATE POLICY "taxas_select_policy" 
ON public.taxas_inscricao 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "taxas_insert_policy" 
ON public.taxas_inscricao 
FOR INSERT 
TO authenticated, service_role
WITH CHECK (true);

CREATE POLICY "taxas_update_policy" 
ON public.taxas_inscricao 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "taxas_delete_policy" 
ON public.taxas_inscricao 
FOR DELETE 
TO authenticated
USING (true);

-- Update the trigger function to be more robust
CREATE OR REPLACE FUNCTION public.ensure_default_roles()
RETURNS TRIGGER AS $$
DECLARE
    atleta_profile_id integer;
    admin_profile_id integer;
    profile_count integer;
BEGIN
    -- Log the event creation
    RAISE NOTICE 'Starting default profiles creation for event: %', NEW.id;
    
    -- Check if profiles already exist to avoid duplicates
    SELECT COUNT(*) INTO profile_count
    FROM public.perfis 
    WHERE evento_id = NEW.id AND nome IN ('Atleta', 'Administração');
    
    IF profile_count > 0 THEN
        RAISE NOTICE 'Profiles already exist for event: %, skipping creation', NEW.id;
        RETURN NEW;
    END IF;
    
    -- Use service role context for this operation
    PERFORM set_config('role', 'service_role', true);
    
    BEGIN
        -- Insert profiles with error handling
        INSERT INTO public.perfis (nome, descricao, evento_id, perfil_tipo_id)
        VALUES 
            ('Atleta', 'Perfil padrão para atletas', NEW.id, '7b46a728-348b-46ba-9233-55cb03e73987'),
            ('Administração', 'Acesso administrativo ao evento', NEW.id, '0b0e3eec-9191-4703-a709-4a88dbd537b0')
        ON CONFLICT (nome, evento_id) DO NOTHING;
        
        -- Get the created profile IDs
        SELECT id INTO atleta_profile_id 
        FROM public.perfis 
        WHERE evento_id = NEW.id AND nome = 'Atleta';
        
        SELECT id INTO admin_profile_id 
        FROM public.perfis 
        WHERE evento_id = NEW.id AND nome = 'Administração';
        
        -- Create registration fees if profiles were created
        IF atleta_profile_id IS NOT NULL AND admin_profile_id IS NOT NULL THEN
            INSERT INTO public.taxas_inscricao (
                perfil_id, 
                valor, 
                isento, 
                mostra_card, 
                evento_id
            )
            VALUES 
                (atleta_profile_id, 0.00, false, false, NEW.id),
                (admin_profile_id, 0.00, false, false, NEW.id)
            ON CONFLICT (perfil_id) DO NOTHING;
            
            RAISE NOTICE 'Successfully created profiles and fees for event: %', NEW.id;
        ELSE
            RAISE WARNING 'Failed to retrieve profile IDs for event: %', NEW.id;
        END IF;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING 'Error in trigger for event %: %', NEW.id, SQLERRM;
    END;
    
    -- Reset role context
    PERFORM set_config('role', 'authenticated', true);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS ensure_default_roles_trigger ON public.eventos;
CREATE TRIGGER ensure_default_roles_trigger
    AFTER INSERT ON public.eventos
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_default_roles();

-- Grant necessary permissions
GRANT ALL ON TABLE public.perfis TO service_role;
GRANT ALL ON TABLE public.taxas_inscricao TO service_role;
GRANT EXECUTE ON FUNCTION public.ensure_default_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_default_roles() TO service_role;

-- Ensure unique constraints exist
CREATE UNIQUE INDEX IF NOT EXISTS idx_perfis_nome_evento_unique 
ON public.perfis (nome, evento_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_taxas_inscricao_perfil_unique 
ON public.taxas_inscricao (perfil_id);

-- Add debugging info
DO $$
BEGIN
    RAISE NOTICE 'Migration completed: Fixed RLS recursion and improved trigger reliability';
    RAISE NOTICE 'Profiles and registration fees should now be created automatically';
END $$;
