-- DIAGNÓSTICO: INSERÇÃO MANUAL PARA DESCOBRIR O ERRO
-- Objetivo: Simular o que a trigger faz, mas "na mão", para ver o erro explícito.

DO $$
DECLARE
    -- Mude estes valores se quiser testar outros cenários
    v_id uuid := gen_random_uuid();
    v_email text := 'teste_debug_insert@exemplo.com';
    v_filial_id_texto text := '4fa397ae-3f95-4422-9213-91af260e34c9'; -- ID de filial existente!
    v_filial_id uuid;
BEGIN
    RAISE NOTICE '=== TESTE DE INSERÇÃO MANUAL ===';

    -- Simular conversão de filial
    BEGIN
        v_filial_id := v_filial_id_texto::uuid;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao converter filial_id: %', SQLERRM;
    END;

    -- Tentar inserir (isso vai falhar e mostrar o motivo real)
    INSERT INTO public.usuarios (
        id,
        email,
        nome_completo,
        telefone,
        ddi,
        tipo_documento,
        numero_documento,
        genero,
        data_nascimento,
        estado,
        pais,
        filial_id,
        data_criacao,
        confirmado
    ) VALUES (
        v_id,
        v_email,
        'Usuário Teste Debug',
        '11999999999',
        '+55',
        'CPF', -- ou PASSAPORTE
        '12345678901', -- CPF válido (11 dígitos)
        'Masculino',
        '1990-01-01'::date,
        'SP',
        'Brasil',
        v_filial_id, -- Se este ID não existir na tabela filiais, vai dar erro de FK
        NOW(),
        true
    );

    RAISE NOTICE '✅ SUCESSO! A inserção funcionou manualmente (então a trigger deveria funcionar)';
    
    -- Se chegou aqui, remove o teste para não sujar banco
    -- DELETE FROM public.usuarios WHERE id = v_id;

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO NA INSERÇÃO MANUAL:';
    RAISE NOTICE 'SQLSTATE: %', SQLSTATE;
    RAISE NOTICE 'Mensagem: %', SQLERRM;
END;
$$;
