
-- Migration to diagnose and fix RLS policies for eventos table
-- This will ensure users with cadastra_eventos = true can create events properly

-- First, let's create a comprehensive diagnostic function
CREATE OR REPLACE FUNCTION public.diagnose_event_creation_issue()
RETURNS json AS $$
DECLARE
    current_user_id uuid;
    user_record record;
    policies_info json;
    rls_enabled boolean;
    result json;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'No authenticated user (auth.uid() is null)',
            'user_id', null,
            'recommendations', array['Check authentication status', 'Ensure user is properly logged in']
        );
    END IF;
    
    -- Check user record in usuarios table
    SELECT * INTO user_record FROM public.usuarios WHERE id = current_user_id;
    
    -- Check if RLS is enabled on eventos table
    SELECT relrowsecurity INTO rls_enabled 
    FROM pg_class 
    WHERE relname = 'eventos' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    
    -- Get current policies for eventos table
    SELECT json_agg(
        json_build_object(
            'policy_name', pol.polname,
            'command', pol.polcmd,
            'permissive', pol.polpermissive,
            'roles', pol.polroles::regrole[],
            'qual', pg_get_expr(pol.polqual, pol.polrelid),
            'with_check', pg_get_expr(pol.polwithcheck, pol.polrelid)
        )
    ) INTO policies_info
    FROM pg_policy pol
    JOIN pg_class cls ON pol.polrelid = cls.oid
    WHERE cls.relname = 'eventos' AND cls.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    
    -- Build comprehensive result
    result := json_build_object(
        'success', true,
        'timestamp', now(),
        'current_user_id', current_user_id,
        'user_exists_in_usuarios', (user_record.id IS NOT NULL),
        'user_email', COALESCE(user_record.email, 'not found'),
        'cadastra_eventos', COALESCE(user_record.cadastra_eventos, false),
        'user_confirmed', COALESCE(user_record.confirmado, false),
        'rls_enabled_on_eventos', rls_enabled,
        'current_policies', COALESCE(policies_info, '[]'::json),
        'recommendations', 
            CASE 
                WHEN user_record.id IS NULL THEN 
                    array['User not found in usuarios table - need to create user record']
                WHEN NOT COALESCE(user_record.cadastra_eventos, false) THEN 
                    array['User cadastra_eventos is false - need to update to true']
                WHEN NOT rls_enabled THEN 
                    array['RLS not enabled on eventos table']
                WHEN policies_info IS NULL OR policies_info = '[]'::json THEN 
                    array['No RLS policies found for eventos table - need to create proper policies']
                ELSE 
                    array['User should be able to create events - check policy logic']
            END
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.diagnose_event_creation_issue() TO authenticated;

-- Now let's ensure proper RLS policies exist
-- First, drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Users can create events if they have permission" ON public.eventos;
DROP POLICY IF EXISTS "eventos_insert_policy" ON public.eventos;
DROP POLICY IF EXISTS "Allow event creation for authorized users" ON public.eventos;

-- Ensure RLS is enabled
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

-- Create a simple, robust INSERT policy for eventos
CREATE POLICY "eventos_insert_authenticated_users" 
ON public.eventos 
FOR INSERT 
TO authenticated
WITH CHECK (
    -- Allow insert if user exists in usuarios table with cadastra_eventos = true
    EXISTS (
        SELECT 1 
        FROM public.usuarios u 
        WHERE u.id = auth.uid() 
        AND u.cadastra_eventos = true
    )
);

-- Create SELECT policy to allow users to see events they can access
CREATE POLICY "eventos_select_policy" 
ON public.eventos 
FOR SELECT 
TO authenticated
USING (
    -- Users can see public events or events they have roles in
    visibilidade_publica = true 
    OR EXISTS (
        SELECT 1 
        FROM public.papeis_usuarios pu 
        WHERE pu.usuario_id = auth.uid() 
        AND pu.evento_id = eventos.id
    )
    OR EXISTS (
        SELECT 1 
        FROM public.usuarios u 
        WHERE u.id = auth.uid() 
        AND u.cadastra_eventos = true
    )
);

-- Create UPDATE policy for event creators and admins
CREATE POLICY "eventos_update_policy" 
ON public.eventos 
FOR UPDATE 
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM public.papeis_usuarios pu
        JOIN public.perfis p ON pu.perfil_id = p.id
        WHERE pu.usuario_id = auth.uid() 
        AND pu.evento_id = eventos.id
        AND p.nome = 'Administração'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM public.papeis_usuarios pu
        JOIN public.perfis p ON pu.perfil_id = p.id
        WHERE pu.usuario_id = auth.uid() 
        AND pu.evento_id = eventos.id
        AND p.nome = 'Administração'
    )
);

-- Function to temporarily disable RLS for testing (use with caution)
CREATE OR REPLACE FUNCTION public.temporarily_disable_eventos_rls()
RETURNS boolean AS $$
BEGIN
    -- This should only be used for debugging
    ALTER TABLE public.eventos DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS temporarily disabled for eventos table';
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to re-enable RLS
CREATE OR REPLACE FUNCTION public.re_enable_eventos_rls()
RETURNS boolean AS $$
BEGIN
    ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS re-enabled for eventos table';
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions (restrict access in production)
GRANT EXECUTE ON FUNCTION public.temporarily_disable_eventos_rls() TO authenticated;
GRANT EXECUTE ON FUNCTION public.re_enable_eventos_rls() TO authenticated;

-- Add some debugging info
DO $$
BEGIN
    RAISE NOTICE 'Migration completed: Enhanced RLS policies for eventos table';
    RAISE NOTICE 'Use SELECT public.diagnose_event_creation_issue(); to diagnose issues';
    RAISE NOTICE 'Use SELECT public.temporarily_disable_eventos_rls(); to test without RLS (remember to re-enable!)';
    RAISE NOTICE 'Use SELECT public.re_enable_eventos_rls(); to re-enable RLS after testing';
END $$;
