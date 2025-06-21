
-- Update ensure_default_roles function to only create Atleta and Administração profiles
CREATE OR REPLACE FUNCTION public.ensure_default_roles()
RETURNS TRIGGER AS $$
BEGIN
    -- Set the role context to allow RLS bypass for this operation
    PERFORM set_config('role', 'service_role', true);
    
    -- Create only Atleta and Administração profiles for the new event
    INSERT INTO public.perfis (nome, descricao, evento_id, perfil_tipo_id)
    VALUES 
        ('Atleta', 'Perfil padrão para atletas', NEW.id, '7b46a728-348b-46ba-9233-55cb03e73987'),
        ('Administração', 'Acesso administrativo ao evento', NEW.id, '0b0e3eec-9191-4703-a709-4a88dbd537b0')
    ON CONFLICT (nome, evento_id) DO NOTHING;
    
    -- Create default registration fees for both profiles
    INSERT INTO public.taxas_inscricao (perfil_id, valor, descricao)
    SELECT p.id, 0.00, 'Taxa padrão para ' || p.nome
    FROM public.perfis p 
    WHERE p.evento_id = NEW.id 
    AND p.nome IN ('Atleta', 'Administração')
    ON CONFLICT (perfil_id) DO NOTHING;
    
    -- Reset the role context
    PERFORM set_config('role', 'authenticated', true);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is still active
DROP TRIGGER IF EXISTS ensure_default_roles_trigger ON public.eventos;
CREATE TRIGGER ensure_default_roles_trigger
    AFTER INSERT ON public.eventos
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_default_roles();

-- Grant necessary permissions
GRANT ALL ON TABLE public.perfis TO service_role;
GRANT ALL ON TABLE public.taxas_inscricao TO service_role;
GRANT EXECUTE ON FUNCTION public.ensure_default_roles() TO authenticated;
