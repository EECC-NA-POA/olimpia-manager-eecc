
-- Update ensure_default_roles function to include Administração profile creation
CREATE OR REPLACE FUNCTION public.ensure_default_roles()
RETURNS TRIGGER AS $$
BEGIN
    -- Create default profiles for the new event
    INSERT INTO public.perfis (nome, descricao, evento_id, perfil_tipo_id)
    VALUES 
        ('Atleta', 'Perfil padrão para atletas', NEW.id, '7b46a728-348b-46ba-9233-55cb03e73987'),
        ('Juiz', 'Perfil padrão para juízes', NEW.id, 'c8b6adfc-dca6-41fb-bf1d-391413462c61'),
        ('Administração', 'Acesso administrativo ao evento', NEW.id, '0b0e3eec-9191-4703-a709-4a88dbd537b0')
    ON CONFLICT (nome, evento_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is still active
DROP TRIGGER IF EXISTS ensure_default_roles_trigger ON public.eventos;
CREATE TRIGGER ensure_default_roles_trigger
    AFTER INSERT ON public.eventos
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_default_roles();
