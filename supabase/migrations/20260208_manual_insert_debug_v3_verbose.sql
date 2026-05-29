-- DIAGNÓSTICO V3: TABELA DE RESULTADOS (MODO VERBOSO)
-- Este script cria uma tabela temporária de logs para mostrar visualmente o que aconteceu.

BEGIN;

-- 1. Criar tabela temporária para exibir os resultados
CREATE TEMP TABLE IF NOT EXISTS debug_results (
    step_id SERIAL PRIMARY KEY,
    operation TEXT,
    status TEXT,
    message TEXT
);
TRUNCATE debug_results;

DO $$
DECLARE
    v_id uuid := gen_random_uuid();
    v_email text := 'debug_v3_' || floor(random() * 10000)::text || '@teste.com';
    v_filial_id uuid;
    v_count_ddi int;
BEGIN
    -- STEP 1: VERIFICAR COLUNA DDI
    SELECT count(*) INTO v_count_ddi 
    FROM information_schema.columns 
    WHERE table_name = 'usuarios' AND column_name = 'ddi';
    
    IF v_count_ddi > 0 THEN
        INSERT INTO debug_results (operation, status, message) 
        VALUES ('Checar coluna DDI', 'OK', 'A coluna "ddi" existe na tabela usuarios.');
    ELSE
        INSERT INTO debug_results (operation, status, message) 
        VALUES ('Checar coluna DDI', 'ERRO', 'A coluna "ddi" NÃO encontrada! (Erro crítico)');
        RETURN; -- Para aqui se falhar
    END IF;

    -- STEP 2: BUSCAR FILIAL
    SELECT id INTO v_filial_id FROM public.filiais LIMIT 1;
    
    IF v_filial_id IS NOT NULL THEN
        INSERT INTO debug_results (operation, status, message) 
        VALUES ('Buscar Filial Válida', 'OK', 'Filial encontrada: ' || v_filial_id::text);
    ELSE
        INSERT INTO debug_results (operation, status, message) 
        VALUES ('Buscar Filial Válida', 'ERRO', 'Nenhuma filial encontrada na tabela public.filiais!');
        RETURN; -- Para aqui se falhar
    END IF;

    -- STEP 3: TENTAR INSERÇÃO
    BEGIN
        INSERT INTO public.usuarios (
            id, email, nome_completo, telefone, ddi, 
            tipo_documento, numero_documento, genero, data_nascimento, 
            estado, pais, filial_id, data_criacao, confirmado, ativo
        ) VALUES (
            v_id,
            v_email,
            'Usuário Debug V3 (Verboso)',
            '11999999999',
            '+55',
            'CPF',
            '10987654321', -- CPF Fictício
            'Masculino',
            '2000-01-01'::date,
            'SP',
            'Brasil',
            v_filial_id,
            NOW(), true, true
        );

        INSERT INTO debug_results (operation, status, message) 
        VALUES ('Inserir Usuário Teste', 'SUCESSO', 'Usuário criado com email: ' || v_email);

    EXCEPTION WHEN OTHERS THEN
        INSERT INTO debug_results (operation, status, message) 
        VALUES ('Inserir Usuário Teste', 'FALHA', 'Erro SQL: ' || SQLERRM || ' (Code: ' || SQLSTATE || ')');
    END;

END $$;

-- EXIBIR O RELATÓRIO FINAL
SELECT * FROM debug_results ORDER BY step_id;

-- SE DEU SUCESSO, MOSTRAR O USUÁRIO CRIADO
SELECT * FROM public.usuarios WHERE email LIKE 'debug_v3_%' ORDER BY data_criacao DESC LIMIT 1;

COMMIT;
