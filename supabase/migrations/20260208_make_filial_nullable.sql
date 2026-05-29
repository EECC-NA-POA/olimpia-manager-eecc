-- CORREÇÃO FINAL: PERMITIR FILIAL NULA
-- Motivo: O App pode estar enviando uma filial inválida ou vazia.
-- A trigger converte isso para NULL para não quebrar.
-- MAS, a tabela 'usuarios' exige 'filial_id NOT NULL'.
-- Resultado: O insert falha silenciosamente e o perfil não é criado.

-- Solução: Remover a restrição NOT NULL da coluna filial_id.

DO $$
BEGIN
    -- Verificar se a coluna é NOT NULL e remover a restrição
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        AND column_name = 'filial_id' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.usuarios ALTER COLUMN filial_id DROP NOT NULL;
        RAISE NOTICE '✅ Restrição NOT NULL removida de filial_id.';
    ELSE
        RAISE NOTICE 'ℹ️ A coluna filial_id já aceita NULL.';
    END IF;
END $$;
