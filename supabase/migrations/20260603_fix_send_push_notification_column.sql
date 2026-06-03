-- ================================================================
-- FIX: send_push_notification — coluna correta da push_tokens
-- ================================================================
-- A versão deployada referenciava "t.token" (coluna inexistente),
-- causando "column t.token does not exist" ao enviar push. A coluna
-- correta na tabela push_tokens é "fcm_token".
--
-- Esta migration redefine a função com o nome de coluna correto.
-- O DROP prévio evita erro de "cannot change return type" caso a
-- assinatura deployada divirja.
-- ================================================================

DROP FUNCTION IF EXISTS send_push_notification(UUID, TEXT, TEXT, JSONB);

CREATE OR REPLACE FUNCTION send_push_notification(
    p_user_id UUID,
    p_title TEXT,
    p_body TEXT,
    p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(success BOOLEAN, message TEXT, tokens_sent INTEGER) AS $$
DECLARE
    v_token RECORD;
    v_access_token TEXT;
    v_project_id TEXT;
    v_fcm_url TEXT;
    v_request_id BIGINT;
    v_tokens_sent INTEGER := 0;
    v_payload JSONB;
BEGIN
    SELECT project_id, get_firebase_access_token()
    INTO v_project_id, v_access_token
    FROM public.firebase_config WHERE id = 1;

    IF v_access_token IS NULL THEN
        RETURN QUERY SELECT false, 'Firebase access_token não configurado ou expirado'::TEXT, 0;
        RETURN;
    END IF;

    IF v_project_id IS NULL OR v_project_id = '' THEN
        RETURN QUERY SELECT false, 'Firebase project_id não configurado'::TEXT, 0;
        RETURN;
    END IF;

    v_fcm_url := 'https://fcm.googleapis.com/v1/projects/' || v_project_id || '/messages:send';

    -- Enviar para cada token ativo do usuário (coluna: fcm_token)
    FOR v_token IN
        SELECT fcm_token, platform
        FROM public.push_tokens
        WHERE user_id = p_user_id AND is_active = true
    LOOP
        v_payload := jsonb_build_object(
            'message', jsonb_build_object(
                'token', v_token.fcm_token,
                'notification', jsonb_build_object('title', p_title, 'body', p_body),
                'data', p_data,
                'android', jsonb_build_object(
                    'priority', 'high',
                    'notification', jsonb_build_object('channel_id', 'olimpia_notifications')
                ),
                'apns', jsonb_build_object(
                    'payload', jsonb_build_object(
                        'aps', jsonb_build_object(
                            'alert', jsonb_build_object('title', p_title, 'body', p_body),
                            'badge', 1,
                            'sound', 'default'
                        )
                    )
                )
            )
        );

        SELECT net.http_post(
            url := v_fcm_url,
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || v_access_token
            ),
            body := v_payload
        ) INTO v_request_id;

        v_tokens_sent := v_tokens_sent + 1;
    END LOOP;

    IF v_tokens_sent = 0 THEN
        RETURN QUERY SELECT true, 'Nenhum token FCM ativo encontrado para o usuário'::TEXT, 0;
    ELSE
        RETURN QUERY SELECT true, 'Push enviado com sucesso'::TEXT, v_tokens_sent;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION send_push_notification IS 'Envia push para um usuário via FCM HTTP v1 (coluna push_tokens.fcm_token)';
