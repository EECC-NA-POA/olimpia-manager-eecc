-- DIAGNÓSTICO: REMOVER TRIGGER TEMPORARIAMENTE
-- Objetivo: Testar se o erro persiste mesmo sem a nossa trigger.
-- Se o erro sumir, o problema está na função handle_new_user.
-- Se o erro continuar, o problema é no Supabase Auth ou em outra trigger.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
