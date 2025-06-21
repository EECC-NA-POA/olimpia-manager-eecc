
-- Remove duplicate trigger that may be causing conflicts
DROP TRIGGER IF EXISTS ensure_event_default_roles ON public.eventos;

-- Verify the correct trigger still exists
-- This should return one row with trigger_name = 'ensure_default_roles_trigger'
SELECT trigger_name 
FROM information_schema.triggers 
WHERE event_object_table = 'eventos' 
  AND trigger_name = 'ensure_default_roles_trigger'
  AND trigger_schema = 'public';
