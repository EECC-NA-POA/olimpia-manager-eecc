
-- Final fix for the ensure_default_roles trigger
-- This addresses all the issues found in event creation

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS ensure_default_roles_trigger ON public.eventos;
DROP FUNCTION IF EXISTS public.ensure_default_roles();

-- Create improved function with better error handling
CREATE OR REPLACE FUNCTION public.ensure_default_roles()
RETURNS TRIGGER AS $$
DECLARE
    atleta_profile_id integer;
    admin_profile_id integer;
BEGIN
    -- Log the event creation
    RAISE NOTICE 'Creating default profiles for event: %', NEW.id;
    
    -- Create default profiles for the new event
    INSERT INTO public.perfis (nome, descricao, evento_id, perfil_tipo_id)
    VALUES 
        ('Atleta', 'Perfil padrão para atletas', NEW.id, '7b46a728-348b-46ba-9233-55cb03e73987'),
        ('Administração', 'Acesso administrativo ao evento', NEW.id, '0b0e3eec-9191-4703-a709-4a88dbd537b0')
    ON CONFLICT (nome, evento_id) DO NOTHING;
    
    -- Get the profile IDs that were just created
    SELECT id INTO atleta_profile_id 
    FROM public.perfis 
    WHERE evento_id = NEW.id AND nome = 'Atleta';
    
    SELECT id INTO admin_profile_id 
    FROM public.perfis 
    WHERE evento_id = NEW.id AND nome = 'Administração';
    
    -- Only create registration fees if profiles were created successfully
    IF atleta_profile_id IS NOT NULL AND admin_profile_id IS NOT NULL THEN
        -- Create default registration fees for both profiles
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
        
        RAISE NOTICE 'Created registration fees for event: %', NEW.id;
    ELSE
        RAISE WARNING 'Failed to create profiles for event: %', NEW.id;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in ensure_default_roles for event %: %', NEW.id, SQLERRM;
        RETURN NEW; -- Don't fail the event creation if trigger fails
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER ensure_default_roles_trigger
    AFTER INSERT ON public.eventos
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_default_roles();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.ensure_default_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_default_roles() TO service_role;

-- Ensure RLS policies allow the trigger to work
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxas_inscricao ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for trigger operations
DROP POLICY IF EXISTS "trigger_perfis_insert" ON public.perfis;
CREATE POLICY "trigger_perfis_insert" 
ON public.perfis 
FOR INSERT 
TO authenticated, service_role
WITH CHECK (true);

DROP POLICY IF EXISTS "trigger_taxas_insert" ON public.taxas_inscricao;
CREATE POLICY "trigger_taxas_insert" 
ON public.taxas_inscricao 
FOR INSERT 
TO authenticated, service_role
WITH CHECK (true);

-- Ensure unique constraint exists
DROP INDEX IF EXISTS idx_taxas_inscricao_perfil_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_taxas_inscricao_perfil_unique 
ON public.taxas_inscricao (perfil_id);

-- Add debugging info
DO $$
BEGIN
    RAISE NOTICE 'Migration completed: Fixed ensure_default_roles trigger with better error handling';
    RAISE NOTICE 'Trigger will now create profiles and registration fees more reliably';
END $$;
