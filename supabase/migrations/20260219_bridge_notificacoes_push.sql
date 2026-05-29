-- ================================================================
-- BRIDGE: notificacoes → Push Notifications
-- ================================================================
-- Quando uma notificação é criada pelo painel web (Organizador ou
-- Representante de Delegação), este trigger resolve os usuários
-- alvo e envia push notification para cada um via FCM/pg_net.
--
-- Fluxo:
--   1. NotificationForm insere em notificacoes
--   2. NotificationForm insere em notificacao_destinatarios
--   3. Este trigger dispara para cada destinatário inserido
--   4. Resolve os usuários (por filial ou todos do evento)
--   5. Chama send_push_notification() para cada usuário com token FCM
-- ================================================================

-- Função que resolve usuários e envia push
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

    IF NOT FOUND THEN
        RAISE NOTICE 'Notificação % não encontrada', NEW.notificacao_id;
        RETURN NEW;
    END IF;

    -- 2. Limpar HTML da mensagem e limitar a 200 caracteres
    v_body_clean := left(regexp_replace(v_notificacao.mensagem, '<[^>]+>', '', 'g'), 200);

    -- 3. Resolver usuários alvo e enviar push
    IF NEW.filial_id IS NULL THEN
        -- Destinatário = TODOS: enviar para todos os inscritos no evento com token ativo
        -- (exceto o próprio autor da notificação)
        FOR v_user IN
            SELECT DISTINCT ie.usuario_id
            FROM public.inscricoes_eventos ie
            INNER JOIN public.push_tokens pt
                ON pt.user_id = ie.usuario_id AND pt.is_active = true
            WHERE ie.evento_id = v_notificacao.evento_id
              AND ie.usuario_id != v_notificacao.autor_id
        LOOP
            PERFORM send_push_notification(
                v_user.usuario_id,
                v_notificacao.titulo,
                v_body_clean,
                jsonb_build_object(
                    'type', 'general_announcement',
                    'evento_id', v_notificacao.evento_id::text,
                    'notificacao_id', v_notificacao.id::text
                )
            );
            v_push_count := v_push_count + 1;
        END LOOP;
    ELSE
        -- Destinatário = filial específica: enviar para inscritos daquela filial
        -- (exceto o próprio autor)
        FOR v_user IN
            SELECT DISTINCT ie.usuario_id
            FROM public.inscricoes_eventos ie
            INNER JOIN public.usuarios u
                ON u.id = ie.usuario_id
            INNER JOIN public.push_tokens pt
                ON pt.user_id = ie.usuario_id AND pt.is_active = true
            WHERE ie.evento_id = v_notificacao.evento_id
              AND u.filial_id = NEW.filial_id
              AND ie.usuario_id != v_notificacao.autor_id
        LOOP
            PERFORM send_push_notification(
                v_user.usuario_id,
                v_notificacao.titulo,
                v_body_clean,
                jsonb_build_object(
                    'type', 'general_announcement',
                    'evento_id', v_notificacao.evento_id::text,
                    'notificacao_id', v_notificacao.id::text
                )
            );
            v_push_count := v_push_count + 1;
        END LOOP;
    END IF;

    RAISE NOTICE 'Push enviado para % usuários (notificação: %, filial: %)',
        v_push_count, NEW.notificacao_id, COALESCE(NEW.filial_id::text, 'TODOS');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS on_notificacao_destinatario_push ON public.notificacao_destinatarios;

-- Criar trigger AFTER INSERT
CREATE TRIGGER on_notificacao_destinatario_push
    AFTER INSERT ON public.notificacao_destinatarios
    FOR EACH ROW
    EXECUTE FUNCTION trigger_push_on_notificacao_destinatario();

-- Comentário
COMMENT ON FUNCTION trigger_push_on_notificacao_destinatario IS
    'Bridge: quando uma notificação do painel web é criada, resolve os usuários alvo e envia push via FCM/pg_net';

-- ================================================================
-- VERIFICAÇÃO
-- ================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'BRIDGE NOTIFICACOES → PUSH - INSTALAÇÃO CONCLUÍDA!';
    RAISE NOTICE '==================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Agora quando um Organizador ou Representante de';
    RAISE NOTICE 'Delegação criar uma notificação pelo painel web,';
    RAISE NOTICE 'ela será automaticamente enviada como push para';
    RAISE NOTICE 'os dispositivos móveis dos destinatários.';
    RAISE NOTICE '';
    RAISE NOTICE 'Para testar:';
    RAISE NOTICE '1. Crie uma notificação pelo painel web';
    RAISE NOTICE '2. Verifique se chegou como push no celular';
    RAISE NOTICE '';
END $$;
