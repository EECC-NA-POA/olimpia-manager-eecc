-- ============================================================
-- Migration: Delegações Multi-Filial
-- Permite agrupar várias filiais em uma delegação por evento
-- ============================================================

-- 1. Tabela principal de delegações
CREATE TABLE IF NOT EXISTS delegacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    descricao TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para buscar delegações de um evento
CREATE INDEX IF NOT EXISTS idx_delegacoes_evento ON delegacoes(evento_id);

-- 2. Tabela de filiais que compõem cada delegação (N:N)
CREATE TABLE IF NOT EXISTS delegacao_filiais (
    delegacao_id UUID NOT NULL REFERENCES delegacoes(id) ON DELETE CASCADE,
    filial_id UUID NOT NULL REFERENCES filiais(id) ON DELETE CASCADE,
    PRIMARY KEY (delegacao_id, filial_id)
);

CREATE INDEX IF NOT EXISTS idx_delegacao_filiais_filial ON delegacao_filiais(filial_id);

-- 3. Tabela de representantes de cada delegação (N:N, mas 1 rep → 1 delegação por evento)
CREATE TABLE IF NOT EXISTS delegacao_representantes (
    delegacao_id UUID NOT NULL REFERENCES delegacoes(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (delegacao_id, usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_delegacao_reps_usuario ON delegacao_representantes(usuario_id);

-- ============================================================
-- Trigger: impedir que um usuário pertença a 2 delegações no
-- mesmo evento (constraint cross-table)
-- ============================================================
CREATE OR REPLACE FUNCTION check_unique_rep_per_event()
RETURNS TRIGGER AS $$
DECLARE
    v_evento_id UUID;
    v_existing_count INT;
BEGIN
    -- Buscar o evento_id da delegação sendo inserida
    SELECT evento_id INTO v_evento_id
    FROM delegacoes
    WHERE id = NEW.delegacao_id;

    -- Contar quantas delegações do MESMO evento já têm esse usuário
    SELECT COUNT(*) INTO v_existing_count
    FROM delegacao_representantes dr
    JOIN delegacoes d ON d.id = dr.delegacao_id
    WHERE dr.usuario_id = NEW.usuario_id
      AND d.evento_id = v_evento_id
      AND dr.delegacao_id != NEW.delegacao_id;

    IF v_existing_count > 0 THEN
        RAISE EXCEPTION 'O representante já pertence a outra delegação neste evento.'
            USING ERRCODE = '23505'; -- unique_violation
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_unique_rep_per_event ON delegacao_representantes;
CREATE TRIGGER trg_unique_rep_per_event
    BEFORE INSERT OR UPDATE ON delegacao_representantes
    FOR EACH ROW
    EXECUTE FUNCTION check_unique_rep_per_event();

-- ============================================================
-- RPC: get_user_delegacao_filiais
-- Retorna as filial_ids do escopo do representante
-- Se houver delegação → filiais da delegação
-- Senão → [user.filial_id] (fallback)
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_delegacao_filiais(
    p_user_id UUID,
    p_evento_id UUID
)
RETURNS UUID[] AS $$
DECLARE
    v_filiais UUID[];
    v_user_filial UUID;
BEGIN
    -- Buscar filiais via delegação
    SELECT ARRAY_AGG(df.filial_id)
    INTO v_filiais
    FROM delegacao_representantes dr
    JOIN delegacoes d ON d.id = dr.delegacao_id
    JOIN delegacao_filiais df ON df.delegacao_id = d.id
    WHERE dr.usuario_id = p_user_id
      AND d.evento_id = p_evento_id;

    -- Se encontrou delegação com filiais, retornar
    IF v_filiais IS NOT NULL AND array_length(v_filiais, 1) > 0 THEN
        RETURN v_filiais;
    END IF;

    -- Fallback: filial_id direta do usuário
    SELECT filial_id INTO v_user_filial
    FROM usuarios
    WHERE id = p_user_id;

    IF v_user_filial IS NOT NULL THEN
        RETURN ARRAY[v_user_filial];
    END IF;

    -- Sem delegação e sem filial → array vazio
    RETURN ARRAY[]::UUID[];
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RLS Policies
-- ============================================================

-- Delegações: leitura para participantes do evento, escrita para ORG/ADM
ALTER TABLE delegacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "delegacoes_select_policy" ON delegacoes
    FOR SELECT USING (true);

CREATE POLICY "delegacoes_insert_policy" ON delegacoes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM papeis_usuarios pu
            JOIN perfis p ON p.id = pu.perfil_id
            JOIN perfis_tipo pt ON pt.id = p.perfil_tipo_id
            WHERE pu.usuario_id = auth.uid()
              AND pu.evento_id = evento_id
              AND pt.codigo IN ('ORG', 'ADM')
        )
        OR EXISTS (
            SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.is_master = true
        )
    );

CREATE POLICY "delegacoes_update_policy" ON delegacoes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM papeis_usuarios pu
            JOIN perfis p ON p.id = pu.perfil_id
            JOIN perfis_tipo pt ON pt.id = p.perfil_tipo_id
            WHERE pu.usuario_id = auth.uid()
              AND pu.evento_id = evento_id
              AND pt.codigo IN ('ORG', 'ADM')
        )
        OR EXISTS (
            SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.is_master = true
        )
    );

CREATE POLICY "delegacoes_delete_policy" ON delegacoes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM papeis_usuarios pu
            JOIN perfis p ON p.id = pu.perfil_id
            JOIN perfis_tipo pt ON pt.id = p.perfil_tipo_id
            WHERE pu.usuario_id = auth.uid()
              AND pu.evento_id = evento_id
              AND pt.codigo IN ('ORG', 'ADM')
        )
        OR EXISTS (
            SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.is_master = true
        )
    );

-- Delegacao filiais: mesmas regras via parent
ALTER TABLE delegacao_filiais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "delegacao_filiais_select" ON delegacao_filiais
    FOR SELECT USING (true);

CREATE POLICY "delegacao_filiais_insert" ON delegacao_filiais
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM delegacoes d
            JOIN papeis_usuarios pu ON pu.evento_id = d.evento_id
            JOIN perfis p ON p.id = pu.perfil_id
            JOIN perfis_tipo pt ON pt.id = p.perfil_tipo_id
            WHERE d.id = delegacao_id
              AND pu.usuario_id = auth.uid()
              AND pt.codigo IN ('ORG', 'ADM')
        )
        OR EXISTS (
            SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.is_master = true
        )
    );

CREATE POLICY "delegacao_filiais_delete" ON delegacao_filiais
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM delegacoes d
            JOIN papeis_usuarios pu ON pu.evento_id = d.evento_id
            JOIN perfis p ON p.id = pu.perfil_id
            JOIN perfis_tipo pt ON pt.id = p.perfil_tipo_id
            WHERE d.id = delegacao_id
              AND pu.usuario_id = auth.uid()
              AND pt.codigo IN ('ORG', 'ADM')
        )
        OR EXISTS (
            SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.is_master = true
        )
    );

-- Delegacao representantes: mesmas regras via parent
ALTER TABLE delegacao_representantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "delegacao_reps_select" ON delegacao_representantes
    FOR SELECT USING (true);

CREATE POLICY "delegacao_reps_insert" ON delegacao_representantes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM delegacoes d
            JOIN papeis_usuarios pu ON pu.evento_id = d.evento_id
            JOIN perfis p ON p.id = pu.perfil_id
            JOIN perfis_tipo pt ON pt.id = p.perfil_tipo_id
            WHERE d.id = delegacao_id
              AND pu.usuario_id = auth.uid()
              AND pt.codigo IN ('ORG', 'ADM')
        )
        OR EXISTS (
            SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.is_master = true
        )
    );

CREATE POLICY "delegacao_reps_delete" ON delegacao_representantes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM delegacoes d
            JOIN papeis_usuarios pu ON pu.evento_id = d.evento_id
            JOIN perfis p ON p.id = pu.perfil_id
            JOIN perfis_tipo pt ON pt.id = p.perfil_tipo_id
            WHERE d.id = delegacao_id
              AND pu.usuario_id = auth.uid()
              AND pt.codigo IN ('ORG', 'ADM')
        )
        OR EXISTS (
            SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.is_master = true
        )
    );
