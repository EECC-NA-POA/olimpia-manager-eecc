-- DIAGNÓSTICO: TRIGGERS NO SCHEMA PUBLIC
-- Objetivo: Ver se existem triggers "hidden" na tabela usuarios ou outras.

BEGIN;

CREATE TEMP TABLE IF NOT EXISTS public_trigger_logs (
    id SERIAL PRIMARY KEY,
    tbl TEXT,
    trig TEXT,
    action TEXT
);

DO $$
DECLARE
    t RECORD;
BEGIN
    FOR t IN 
        SELECT event_object_table, trigger_name 
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
    LOOP
        INSERT INTO public_trigger_logs (tbl, trig, action) 
        VALUES (t.event_object_table, t.trigger_name, 'DETECTADA');
        
        -- Opcional: Se quiser apagar suspeitas, descomente abaixo
        -- IF t.event_object_table = 'usuarios' THEN
        --    EXECUTE 'DROP TRIGGER IF EXISTS "' || t.trigger_name || '" ON public.' || t.event_object_table;
        --    INSERT INTO public_trigger_logs (tbl, trig, action) VALUES (t.event_object_table, t.trigger_name, 'DELETADA');
        -- END IF;
    END LOOP;
END $$;

SELECT * FROM public_trigger_logs;

COMMIT;
