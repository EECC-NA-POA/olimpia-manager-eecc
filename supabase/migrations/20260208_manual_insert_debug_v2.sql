-- DIAGNÓSTICO V2: VERIFICAÇÃO COMPLETA
-- Este script verifica se as correções foram aplicadas e tenta inserir um usuário com dados reais do seu banco.

DO $$
DECLARE
    v_id uuid := gen_random_uuid();
    v_email text := 'debug_v2_' || floor(random() * 1000)::text || '@teste.com';
    v_filial_id uuid;
    v_count_ddi int;
BEGIN
    RAISE NOTICE '=== INICIANDO DIAGNÓSTICO V2 ===';

    -- 1. VERIFICAR SE A COLUNA 'DDI' EXISTE
    SELECT count(*) INTO v_count_ddi 
    FROM information_schema.columns 
    WHERE table_name = 'usuarios' AND column_name = 'ddi';
    
    IF v_count_ddi = 0 THEN
        RAISE EXCEPTION '❌ CRÍTICO: A coluna DDI NÃO EXISTE na tabela. O script anterior não rodou ou falhou.';
    ELSE
        RAISE NOTICE '✅ Check 1: Coluna DDI existe.';
    END IF;

    -- 2. BUSCAR UMA FILIAL VÁLIDA (Para evitar erro de chave estrangeira)
    SELECT id INTO v_filial_id FROM public.filiais LIMIT 1;
    
    IF v_filial_id IS NULL THEN
        RAISE EXCEPTION '❌ CRÍTICO: Tabela de filiais está vazia! Não é possível cadastrar usuário sem filial.';
    END IF;
    
    RAISE NOTICE '✅ Check 2: Filial válida encontrada: %', v_filial_id;

    -- 3. TENTAR INSERIR USUÁRIO (Simulação da Trigger)
    BEGIN
        INSERT INTO public.usuarios (
            id, email, nome_completo, telefone, ddi, 
            tipo_documento, numero_documento, genero, data_nascimento, 
            estado, pais, filial_id, data_criacao, confirmado, ativo
        ) VALUES (
            v_id,
            v_email,
            'Usuário Debug V2',
            '11999999999',
            '+55',
            'CPF',
            '12345678909',
            'Masculino',
            '1990-01-01'::date,
            'SP',
            'Brasil',
            v_filial_id,
            NOW(), true, true
        );
        RAISE NOTICE '🎉 SUCESSO TOTAL! A tabela aceitou o registro. O problema deve estar resolvido.';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '💣 ERRO FATAL NA INSERÇÃO:';
        RAISE NOTICE 'Mensagem: %', SQLERRM;
        RAISE NOTICE 'Código: %', SQLSTATE;
        RAISE EXCEPTION 'Falha na inserção de teste';
    END;

END;
$$;
