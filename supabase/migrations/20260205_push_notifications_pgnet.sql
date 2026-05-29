-- Migration: 20260205_push_notifications_pgnet.sql
-- Push Notifications via PostgreSQL + pg_net (sem Edge Functions)
-- Para Supabase auto-hospedado

-- ====================
-- 1. HABILITAR EXTENSÕES NECESSÁRIAS
-- ====================
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ====================
-- 2. TABELA DE CONFIGURAÇÃO DO FIREBASE
-- ====================
CREATE TABLE IF NOT EXISTS public.firebase_config (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Garante apenas 1 registro
    project_id TEXT NOT NULL,
    client_email TEXT NOT NULL,
    private_key TEXT NOT NULL,
    access_token TEXT,
    token_expires_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir configuração inicial (você vai atualizar depois)
INSERT INTO public.firebase_config (project_id, client_email, private_key)
VALUES ('', '', '')
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.firebase_config IS 'Configuração do Firebase para push notifications. Atualize com os dados do seu service account.';

-- ====================
-- 3. FUNÇÃO PARA OBTER ACCESS TOKEN DO FIREBASE
-- ====================
-- NOTA: Esta função requer que você gere o access_token externamente
-- e atualize a tabela firebase_config periodicamente (tokens duram 1 hora)
--
-- Para gerar o token manualmente:
-- gcloud auth print-access-token --impersonate-service-account=firebase-adminsdk-xxx@project.iam.gserviceaccount.com

CREATE OR REPLACE FUNCTION get_firebase_access_token()
RETURNS TEXT AS $$
DECLARE
    v_token TEXT;
    v_expires_at TIMESTAMPTZ;
BEGIN
    SELECT access_token, token_expires_at
    INTO v_token, v_expires_at
    FROM public.firebase_config
    WHERE id = 1;

    -- Verificar se o token existe e não expirou
    IF v_token IS NULL OR v_expires_at IS NULL OR v_expires_at < now() THEN
        RAISE WARNING 'Firebase access_token não configurado ou expirado. Execute: SELECT update_firebase_token(''seu_token'');';
        RETURN NULL;
    END IF;

    RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================
-- 4. FUNÇÃO PARA ATUALIZAR O ACCESS TOKEN
-- ====================
CREATE OR REPLACE FUNCTION update_firebase_token(p_access_token TEXT, p_expires_in_seconds INTEGER DEFAULT 3600)
RETURNS void AS $$
BEGIN
    UPDATE public.firebase_config
    SET
        access_token = p_access_token,
        token_expires_at = now() + (p_expires_in_seconds || ' seconds')::interval,
        updated_at = now()
    WHERE id = 1;

    RAISE NOTICE 'Firebase token atualizado. Expira em: %', now() + (p_expires_in_seconds || ' seconds')::interval;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================
-- 5. FUNÇÃO PRINCIPAL: ENVIAR PUSH NOTIFICATION
-- ====================
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
    -- Obter configuração do Firebase
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

    -- Enviar para cada token ativo do usuário
    FOR v_token IN
        SELECT fcm_token, platform
        FROM public.push_tokens
        WHERE user_id = p_user_id AND is_active = true
    LOOP
        -- Montar payload do FCM
        v_payload := jsonb_build_object(
            'message', jsonb_build_object(
                'token', v_token.fcm_token,
                'notification', jsonb_build_object(
                    'title', p_title,
                    'body', p_body
                ),
                'data', p_data,
                -- Configurações específicas por plataforma
                'android', jsonb_build_object(
                    'priority', 'high',
                    'notification', jsonb_build_object(
                        'channel_id', 'olimpia_notifications'
                    )
                ),
                'apns', jsonb_build_object(
                    'payload', jsonb_build_object(
                        'aps', jsonb_build_object(
                            'alert', jsonb_build_object(
                                'title', p_title,
                                'body', p_body
                            ),
                            'badge', 1,
                            'sound', 'default'
                        )
                    )
                )
            )
        );

        -- Enviar via pg_net
        SELECT net.http_post(
            url := v_fcm_url,
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || v_access_token
            ),
            body := v_payload
        ) INTO v_request_id;

        v_tokens_sent := v_tokens_sent + 1;

        RAISE NOTICE 'Push enviado para token % (request_id: %)', substring(v_token.fcm_token, 1, 20) || '...', v_request_id;
    END LOOP;

    IF v_tokens_sent = 0 THEN
        RETURN QUERY SELECT true, 'Nenhum token FCM ativo encontrado para o usuário'::TEXT, 0;
    ELSE
        RETURN QUERY SELECT true, 'Push enviado com sucesso'::TEXT, v_tokens_sent;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================
-- 6. FUNÇÃO PARA PROCESSAR NOTIFICAÇÃO E ENVIAR PUSH
-- ====================
CREATE OR REPLACE FUNCTION process_notification_push(p_notification_id UUID)
RETURNS void AS $$
DECLARE
    v_notification RECORD;
    v_result RECORD;
BEGIN
    -- Buscar notificação
    SELECT * INTO v_notification
    FROM public.notifications
    WHERE id = p_notification_id AND push_sent = false;

    IF NOT FOUND THEN
        RAISE NOTICE 'Notificação não encontrada ou já enviada: %', p_notification_id;
        RETURN;
    END IF;

    -- Enviar push
    SELECT * INTO v_result
    FROM send_push_notification(
        v_notification.user_id,
        v_notification.title,
        v_notification.body,
        v_notification.data
    );

    -- Atualizar status
    IF v_result.success THEN
        UPDATE public.notifications
        SET push_sent = true, push_sent_at = now()
        WHERE id = p_notification_id;
    END IF;

    RAISE NOTICE 'Notificação % processada: success=%, message=%, tokens=%',
        p_notification_id, v_result.success, v_result.message, v_result.tokens_sent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================
-- 7. TRIGGER: ENVIAR PUSH AUTOMATICAMENTE AO CRIAR NOTIFICAÇÃO
-- ====================
CREATE OR REPLACE FUNCTION trigger_send_push_on_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Agendar envio assíncrono via pg_net (não bloqueia a transação)
    PERFORM process_notification_push(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS on_notification_insert ON public.notifications;

-- Criar novo trigger AFTER INSERT (para garantir que o registro existe)
CREATE TRIGGER on_notification_insert_push
    AFTER INSERT ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION trigger_send_push_on_notification();

-- ====================
-- 8. FUNÇÃO AUXILIAR: DESATIVAR TOKENS INVÁLIDOS
-- ====================
CREATE OR REPLACE FUNCTION deactivate_invalid_token(p_fcm_token TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.push_tokens
    SET is_active = false, updated_at = now()
    WHERE fcm_token = p_fcm_token;

    RAISE NOTICE 'Token desativado: %', substring(p_fcm_token, 1, 20) || '...';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================
-- 9. FUNÇÃO PARA ENVIAR PUSH PARA MÚLTIPLOS USUÁRIOS
-- ====================
CREATE OR REPLACE FUNCTION send_push_to_users(
    p_user_ids UUID[],
    p_title TEXT,
    p_body TEXT,
    p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(user_id UUID, success BOOLEAN, tokens_sent INTEGER) AS $$
DECLARE
    v_user_id UUID;
    v_result RECORD;
BEGIN
    FOREACH v_user_id IN ARRAY p_user_ids
    LOOP
        SELECT * INTO v_result
        FROM send_push_notification(v_user_id, p_title, p_body, p_data);

        RETURN QUERY SELECT v_user_id, v_result.success, v_result.tokens_sent;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================
-- 10. FUNÇÃO PARA ENVIAR PUSH PARA TODOS OS USUÁRIOS (BROADCAST)
-- ====================
CREATE OR REPLACE FUNCTION send_push_broadcast(
    p_title TEXT,
    p_body TEXT,
    p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(total_users INTEGER, total_tokens INTEGER) AS $$
DECLARE
    v_user_ids UUID[];
    v_result RECORD;
    v_total_users INTEGER := 0;
    v_total_tokens INTEGER := 0;
BEGIN
    -- Obter todos os usuários com tokens ativos
    SELECT ARRAY_AGG(DISTINCT user_id) INTO v_user_ids
    FROM public.push_tokens
    WHERE is_active = true;

    IF v_user_ids IS NULL OR array_length(v_user_ids, 1) IS NULL THEN
        RETURN QUERY SELECT 0, 0;
        RETURN;
    END IF;

    -- Enviar para cada usuário
    FOR v_result IN SELECT * FROM send_push_to_users(v_user_ids, p_title, p_body, p_data)
    LOOP
        v_total_users := v_total_users + 1;
        v_total_tokens := v_total_tokens + COALESCE(v_result.tokens_sent, 0);
    END LOOP;

    RETURN QUERY SELECT v_total_users, v_total_tokens;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ====================
COMMENT ON FUNCTION send_push_notification IS 'Envia push notification para um usuário específico via FCM HTTP v1 API';
COMMENT ON FUNCTION send_push_to_users IS 'Envia push notification para múltiplos usuários';
COMMENT ON FUNCTION send_push_broadcast IS 'Envia push notification para todos os usuários com tokens ativos';
COMMENT ON FUNCTION update_firebase_token IS 'Atualiza o access_token do Firebase. Execute periodicamente (tokens duram 1 hora).';
COMMENT ON FUNCTION process_notification_push IS 'Processa uma notificação pendente e envia o push';
