-- ================================================================
-- 1. Toggles de Módulos para Eventos
-- Permite ligar/desligar painéis de pontuação e chamada por evento
-- ================================================================

ALTER TABLE public.eventos
ADD COLUMN IF NOT EXISTS has_scores BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS has_attendance BOOLEAN DEFAULT true;

-- Atualizar visões (views) relacionadas se necessário para expor as novas flags
-- (Neste caso, os campos são simples e estarão disponíveis para selects na tabela base)

-- ================================================================
-- 2. Suporte a Modalidade em Destinatários de Notificação
-- Permite que Filósofos Monitores enviem push notifications nativos
-- apenas para atletas de uma modalidade específica.
-- ================================================================

-- Adicionar a referência a modalidade em notificacao_destinatarios
ALTER TABLE public.notificacao_destinatarios
ADD COLUMN IF NOT EXISTS modalidade_id BIGINT REFERENCES public.modalidades(id);

-- Atualizar o trigger de push para considerar modalidade_id e filial_id_evento
-- Drop and recreate the trigger function
CREATE OR REPLACE FUNCTION trigger_push_on_notificacao_destinatario()
RETURNS TRIGGER AS $$
DECLARE
    v_notificacao RECORD;
    v_user RECORD;
    v_body_clean TEXT;
    v_push_count INTEGER := 0;
BEGIN
    -- 1. Buscar a notificação pai
    SELECT id, evento_id, titulo, mensagem, tipo_autor, autor_id
    INTO v_notificacao
    FROM public.notificacoes
    WHERE id = NEW.notificacao_id;

    -- Limpar tags HTML da mensagem para o push nativo
    v_body_clean := REGEXP_REPLACE(v_notificacao.mensagem, '<[^>]*>', '', 'g');

    -- 2. Resolução Dinâmica de Usuários Baseada no Destinatário
    
    -- Caso A: Se modalidade_id for fornecido (ex: Filósofo Monitor)
    IF NEW.modalidade_id IS NOT NULL THEN
        FOR v_user IN
            SELECT DISTINCT u.id, t.token
            FROM public.inscricoes_modalidades im
            JOIN public.usuarios u ON u.id = im.atleta_id
            JOIN public.push_tokens t ON t.user_id = u.id
            WHERE im.evento_id = v_notificacao.evento_id
              AND im.modalidade_id = NEW.modalidade_id
              -- Adicione filtros de status de inscrição se desejar que apenas confirmados recebam:
              -- AND im.status = 'confirmado'
              AND u.id != v_notificacao.autor_id -- não enviar para o autor
        LOOP
            PERFORM send_push_notification(v_user.token, v_notificacao.titulo, v_body_clean, v_notificacao.id);
            v_push_count := v_push_count + 1;
        END LOOP;

    -- Caso B: Se filial_id for NULL (ex: Organizador enviando para TODAS as filiais)
    ELSIF NEW.filial_id IS NULL THEN
        FOR v_user IN
            -- Neste caso, buscar qualquer usuário com token ativo, 
            -- idealmente cruzado com quem tem inscrição (papeis_usuarios) no evento,
            -- mas o comportamento atual enviava para geral da filial_id=null.
            -- Para evitar spam global, melhor enviar para quem tem papel no evento.
            SELECT DISTINCT u.id, t.token
            FROM public.papeis_usuarios pu
            JOIN public.usuarios u ON u.id = pu.usuario_id
            JOIN public.push_tokens t ON t.user_id = u.id
            WHERE pu.evento_id = v_notificacao.evento_id
              AND u.id != v_notificacao.autor_id
        LOOP
            PERFORM send_push_notification(v_user.token, v_notificacao.titulo, v_body_clean, v_notificacao.id);
            v_push_count := v_push_count + 1;
        END LOOP;

    -- Caso C: Se filial_id FORNECEU valor (ex: Representante de Delegação)
    ELSE
        FOR v_user IN
            SELECT DISTINCT u.id, t.token
            FROM public.usuarios u
            JOIN public.push_tokens t ON t.user_id = u.id
            JOIN public.papeis_usuarios pu ON pu.usuario_id = u.id 
            WHERE pu.evento_id = v_notificacao.evento_id
              AND u.filial_id = NEW.filial_id
              AND u.id != v_notificacao.autor_id
        LOOP
            PERFORM send_push_notification(v_user.token, v_notificacao.titulo, v_body_clean, v_notificacao.id);
            v_push_count := v_push_count + 1;
        END LOOP;
    END IF;

    -- Log
    RAISE LOG 'Push disparado para notificacao % via destinatario %: % tokens enviados', NEW.notificacao_id, NEW.id, v_push_count;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
