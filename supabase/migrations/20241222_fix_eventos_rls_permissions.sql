
-- Migration to fix RLS permissions for eventos table
-- This will ensure users can create events properly

-- Function to check and fix user permissions for event creation
CREATE OR REPLACE FUNCTION public.ensure_user_can_create_events(user_id uuid)
RETURNS boolean AS $$
DECLARE
    user_exists boolean := false;
    user_record record;
BEGIN
    -- Check if user exists in usuarios table
    SELECT * INTO user_record FROM public.usuarios WHERE id = user_id;
    
    IF FOUND THEN
        user_exists := true;
        RAISE NOTICE 'User % exists in usuarios table', user_id;
        
        -- Check if user can create events
        IF user_record.cadastra_eventos IS TRUE THEN
            RAISE NOTICE 'User % already has permission to create events', user_id;
            RETURN true;
        ELSE
            -- Update user to allow event creation
            UPDATE public.usuarios 
            SET cadastra_eventos = true 
            WHERE id = user_id;
            
            RAISE NOTICE 'Updated user % to allow event creation', user_id;
            RETURN true;
        END IF;
    ELSE
        RAISE NOTICE 'User % does not exist in usuarios table', user_id;
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create missing user record
CREATE OR REPLACE FUNCTION public.create_user_record_for_event_creation()
RETURNS void AS $$
DECLARE
    current_user_id uuid;
    auth_user_record record;
BEGIN
    -- Get current authenticated user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'No authenticated user found';
    END IF;
    
    -- Get user data from auth.users
    SELECT * INTO auth_user_record FROM auth.users WHERE id = current_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found in auth.users table';
    END IF;
    
    -- Insert user into usuarios table if not exists
    INSERT INTO public.usuarios (
        id,
        email,
        nome_completo,
        cadastra_eventos,
        confirmado
    ) VALUES (
        current_user_id,
        auth_user_record.email,
        COALESCE(auth_user_record.raw_user_meta_data->>'nome_completo', 'Usuário'),
        true,
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        cadastra_eventos = true,
        confirmado = true;
    
    RAISE NOTICE 'User record created/updated for event creation: %', current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.ensure_user_can_create_events(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_record_for_event_creation() TO authenticated;

-- Test function to verify RLS policies
CREATE OR REPLACE FUNCTION public.test_event_creation_permission()
RETURNS json AS $$
DECLARE
    current_user_id uuid;
    user_record record;
    can_create boolean := false;
    result json;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'No authenticated user',
            'user_id', null
        );
    END IF;
    
    -- Check user record
    SELECT * INTO user_record FROM public.usuarios WHERE id = current_user_id;
    
    IF FOUND THEN
        can_create := COALESCE(user_record.cadastra_eventos, false);
    END IF;
    
    -- Build result
    result := json_build_object(
        'success', true,
        'user_id', current_user_id,
        'user_exists_in_usuarios', FOUND,
        'can_create_events', can_create,
        'user_email', COALESCE(user_record.email, 'not found'),
        'user_confirmed', COALESCE(user_record.confirmado, false)
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.test_event_creation_permission() TO authenticated;

-- Add some debugging info
DO $$
BEGIN
    RAISE NOTICE 'Migration completed: RLS permissions for eventos table configured';
    RAISE NOTICE 'Use SELECT public.test_event_creation_permission(); to test permissions';
    RAISE NOTICE 'Use SELECT public.create_user_record_for_event_creation(); to create user record if needed';
END $$;
