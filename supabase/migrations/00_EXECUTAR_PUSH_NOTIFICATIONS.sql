-- ================================================================
-- PUSH NOTIFICATIONS - MIGRATION CONSOLIDADA
-- Execute este arquivo no SQL Editor do Supabase
-- ================================================================
--
-- Este arquivo consolida duas migrations:
-- 1. 20260203_create_push_notifications_tables.sql - Tabelas base
-- 2. 20260205_push_notifications_pgnet.sql - Funções pg_net
--
-- IMPORTANTE: Este sistema é SEPARADO do sistema de notificações
-- in-app existente (tabelas notificacoes, notificacao_destinatarios).
-- Os dois sistemas coexistem sem conflito.
--
-- ================================================================

-- ====================
-- PARTE 1: EXTENSÕES
-- ====================
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ====================
-- PARTE 2: TABELA PUSH_TOKENS
-- Armazena tokens FCM dos dispositivos
-- ====================
CREATE TABLE IF NOT EXISTS public.push_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fcm_token TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    device_info JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Unique constraint: one token per user per device
CREATE UNIQUE INDEX IF NOT EXISTS idx_push_tokens_user_token ON public.push_tokens(user_id, fcm_token);

-- Index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON public.push_tokens(user_id);

-- Index for active tokens only
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON public.push_tokens(user_id) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies: User can only manage their own tokens
DROP POLICY IF EXISTS "Users can view own push tokens" ON public.push_tokens;
CREATE POLICY "Users can view own push tokens"
    ON public.push_tokens FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own push tokens" ON public.push_tokens;
CREATE POLICY "Users can insert own push tokens"
    ON public.push_tokens FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own push tokens" ON public.push_tokens;
CREATE POLICY "Users can update own push tokens"
    ON public.push_tokens FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own push tokens" ON public.push_tokens;
CREATE POLICY "Users can delete own push tokens"
    ON public.push_tokens FOR DELETE
    USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_push_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS push_tokens_updated_at ON public.push_tokens;
CREATE TRIGGER push_tokens_updated_at
    BEFORE UPDATE ON public.push_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_push_tokens_updated_at();

COMMENT ON TABLE public.push_tokens IS 'Tokens FCM dos dispositivos para push notifications';

-- ====================
-- PARTE 3: TABELA NOTIFICATIONS (Push)
-- Armazena notificações push enviadas
-- ====================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    evento_id UUID REFERENCES public.eventos(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'enrollment_confirmed',
        'game_reminder',
        'result_published',
        'general_announcement'
    )),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN DEFAULT false,
    push_sent BOOLEAN DEFAULT false,
    push_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_pending_push ON public.notifications(id) WHERE push_sent = false;

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

COMMENT ON TABLE public.notifications IS 'Notificações push enviadas aos usuários';

-- ====================
-- PARTE 4: TABELA FIREBASE_CONFIG
-- Configurações do Firebase para envio de push
-- ====================
CREATE TABLE IF NOT EXISTS public.firebase_config (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Garante apenas 1 registro
    project_id TEXT NOT NULL DEFAULT '',
    client_email TEXT NOT NULL DEFAULT '',
    private_key TEXT NOT NULL DEFAULT '',
    access_token TEXT,
    token_expires_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir configuração inicial
INSERT INTO public.firebase_config (project_id, client_email, private_key)
VALUES ('', '', '')
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.firebase_config IS 'Configuração do Firebase para push notifications. Atualize com os dados do seu service account.';

-- ====================
-- PARTE 5: FUNÇÕES DE SUPORTE
-- ====================

-- Função para obter access token do Firebase
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

-- Função para atualizar o access token
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
-- PARTE 6: FUNÇÃO PRINCIPAL - ENVIAR PUSH
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
-- PARTE 7: FUNÇÃO PARA PROCESSAR NOTIFICAÇÃO
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
-- PARTE 8: TRIGGER - ENVIAR PUSH AUTOMATICAMENTE
-- ====================
CREATE OR REPLACE FUNCTION trigger_send_push_on_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Enviar push de forma assíncrona
    PERFORM process_notification_push(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS on_notification_insert ON public.notifications;
DROP TRIGGER IF EXISTS on_notification_insert_push ON public.notifications;

-- Criar novo trigger AFTER INSERT
CREATE TRIGGER on_notification_insert_push
    AFTER INSERT ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION trigger_send_push_on_notification();

-- ====================
-- PARTE 9: FUNÇÃO AUXILIAR - DESATIVAR TOKENS INVÁLIDOS
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
-- PARTE 10: FUNÇÕES PARA MÚLTIPLOS USUÁRIOS
-- ====================

-- Enviar push para múltiplos usuários
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

-- Enviar push para TODOS os usuários (broadcast)
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
-- PARTE 11: FUNÇÃO HELPER - CRIAR NOTIFICAÇÃO
-- ====================
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_body TEXT,
    p_evento_id UUID DEFAULT NULL,
    p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, type, title, body, evento_id, data)
    VALUES (p_user_id, p_type, p_title, p_body, p_evento_id, p_data)
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================
-- COMENTÁRIOS
-- ====================
COMMENT ON FUNCTION send_push_notification IS 'Envia push notification para um usuário específico via FCM HTTP v1 API';
COMMENT ON FUNCTION send_push_to_users IS 'Envia push notification para múltiplos usuários';
COMMENT ON FUNCTION send_push_broadcast IS 'Envia push notification para todos os usuários com tokens ativos';
COMMENT ON FUNCTION update_firebase_token IS 'Atualiza o access_token do Firebase. Execute periodicamente (tokens duram 1 hora).';
COMMENT ON FUNCTION process_notification_push IS 'Processa uma notificação pendente e envia o push';
COMMENT ON FUNCTION create_notification IS 'Cria uma notificação e dispara o push automaticamente via trigger';

-- ====================
-- VERIFICAÇÃO FINAL
-- ====================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'PUSH NOTIFICATIONS - INSTALAÇÃO CONCLUÍDA!';
    RAISE NOTICE '==================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tabelas criadas:';
    RAISE NOTICE '  - push_tokens (tokens FCM dos dispositivos)';
    RAISE NOTICE '  - notifications (notificações push)';
    RAISE NOTICE '  - firebase_config (configuração do Firebase)';
    RAISE NOTICE '';
    RAISE NOTICE 'Funções criadas:';
    RAISE NOTICE '  - send_push_notification(user_id, title, body, data)';
    RAISE NOTICE '  - send_push_to_users(user_ids[], title, body, data)';
    RAISE NOTICE '  - send_push_broadcast(title, body, data)';
    RAISE NOTICE '  - create_notification(user_id, type, title, body, ...)';
    RAISE NOTICE '  - update_firebase_token(token, expires_in)';
    RAISE NOTICE '';
    RAISE NOTICE 'PRÓXIMOS PASSOS:';
    RAISE NOTICE '1. Execute o script generate-firebase-token.ps1';
    RAISE NOTICE '2. Execute o SQL gerado para configurar o Firebase';
    RAISE NOTICE '3. Teste com: SELECT * FROM send_push_notification(...);';
    RAISE NOTICE '';
END $$;
