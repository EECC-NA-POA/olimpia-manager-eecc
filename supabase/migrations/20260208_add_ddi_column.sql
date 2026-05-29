-- CORREÇÃO: ADICIONAR COLUMA 'DDI'
-- O erro "column ddi does not exist" confirma que falta esta coluna.

DO $$
BEGIN
    -- Adicionar 'ddi' se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'ddi') THEN
        ALTER TABLE public.usuarios ADD COLUMN ddi text DEFAULT '+55';
        RAISE NOTICE 'Coluna ddi adicionada na tabela usuarios';
    END IF;
END $$;
