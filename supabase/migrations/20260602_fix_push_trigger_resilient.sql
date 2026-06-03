-- ================================================================
-- FIX: torna o trigger de push à prova de falhas
-- ================================================================
-- Problema: se send_push_notification() falhar (ex: coluna divergente,
-- token Firebase expirado, pg_net indisponível), a exceção propaga e
-- ABORTA a criação da notificação inteira no painel web.
--
-- Push notification é best-effort: nunca deve impedir o salvamento da
-- notificação. Este patch envolve toda a lógica num bloco de exceção
-- que apenas registra um WARNING e segue, garantindo que a notificação
-- e seus destinatários sejam sempre persistidos.
-- ================================================================

CREATE OR REPLACE FUNCTION trigger_push_on_notificacao_destinatario()
RETURNS TRIGGER AS $$
DECLARE
    v_notificacao RECORD;
    v_user RECORD;
    v_body_clean TEXT;
    v_push_count INTEGER := 0;
BEGIN
    -- Toda a lógica de push é best-effort: qualquer erro é capturado
    -- e não impede o INSERT do destinatário / criação da notificação.
    BEGIN
        SELECT id, evento_id, titulo, mensagem, tipo_autor, autor_id
        INTO v_notificacao
        FROM public.notificacoes
        WHERE id = NEW.notificacao_id;

        IF NOT FOUND THEN
            RETURN NEW;
        END IF;

        v_body_clean := left(regexp_replace(v_notificacao.mensagem, '<[^>]+>', '', 'g'), 200);

        IF NEW.filial_id IS NULL THEN
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

        RAISE NOTICE 'Push enviado para % usuários (notificação: %)', v_push_count, NEW.notificacao_id;

    EXCEPTION WHEN OTHERS THEN
        -- Qualquer falha no envio de push é registrada mas NÃO aborta a transação
        RAISE WARNING 'Falha ao enviar push para notificação % (ignorado): %', NEW.notificacao_id, SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
