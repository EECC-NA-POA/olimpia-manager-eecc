
-- Add unique constraint on (nome, evento_id) to perfis table
-- This is needed for the ensure_default_roles function to work properly with ON CONFLICT

ALTER TABLE public.perfis 
ADD CONSTRAINT perfis_nome_evento_unique UNIQUE (nome, evento_id);

-- Add comment to document the purpose of this constraint
COMMENT ON CONSTRAINT perfis_nome_evento_unique ON public.perfis IS 
'Ensures each profile name is unique per event, required for ensure_default_roles function';
