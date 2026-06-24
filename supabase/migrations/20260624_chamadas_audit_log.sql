-- ══════════════════════════════════════════════════════════════════════
-- Auditoria de chamadas + presenças  (Items 4 e 5 do plano 2026-06-24)
-- Executar no SQL Editor de sb.nova-acropole.org.br ANTES de fazer merge
-- do PR feat/chamadas-audit-delete em main.
-- ══════════════════════════════════════════════════════════════════════

-- 1. Coluna atualizado_por em chamadas
ALTER TABLE public.chamadas
  ADD COLUMN IF NOT EXISTS atualizado_por uuid REFERENCES public.usuarios(id);

-- 2. UNIQUE em chamada_presencas (necessário para upsert no app)
--    Remove duplicatas mantendo o registro mais recente antes de criar a constraint.
DO $$
BEGIN
  -- limpa duplicatas (mantém o id maior, i.e., o mais recente)
  DELETE FROM public.chamada_presencas a
  USING public.chamada_presencas b
  WHERE a.id < b.id
    AND a.chamada_id = b.chamada_id
    AND a.atleta_id  = b.atleta_id;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.chamada_presencas'::regclass
      AND conname  = 'chamada_presencas_chamada_atleta_key'
  ) THEN
    ALTER TABLE public.chamada_presencas
      ADD CONSTRAINT chamada_presencas_chamada_atleta_key
      UNIQUE (chamada_id, atleta_id);
  END IF;
END$$;

-- 3. Tabela de auditoria
CREATE TABLE IF NOT EXISTS public.chamadas_audit_log (
  id          bigserial PRIMARY KEY,
  entidade    text       NOT NULL CHECK (entidade IN ('chamada', 'presenca')),
  operation   text       NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  chamada_id  uuid       NOT NULL,
  atleta_id   uuid,
  old_data    jsonb,
  new_data    jsonb,
  user_id     uuid       REFERENCES public.usuarios(id),
  timestamp   timestamptz NOT NULL DEFAULT now()
);

-- índice para buscas por chamada (exibição do histórico)
CREATE INDEX IF NOT EXISTS chamadas_audit_log_chamada_id_idx
  ON public.chamadas_audit_log (chamada_id, timestamp DESC);

-- 4. RLS + GRANT na tabela de auditoria
ALTER TABLE public.chamadas_audit_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chamadas_audit_log'
      AND policyname = 'chamadas_audit_log_select'
  ) THEN
    CREATE POLICY "chamadas_audit_log_select"
      ON public.chamadas_audit_log FOR SELECT TO authenticated USING (true);
  END IF;
END$$;

GRANT SELECT ON public.chamadas_audit_log TO authenticated;

-- 5. Função de trigger para chamadas (SECURITY DEFINER fura a RLS no insert do log)
CREATE OR REPLACE FUNCTION public.fn_chamadas_audit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.chamadas_audit_log
      (entidade, operation, chamada_id, new_data, user_id)
    VALUES ('chamada', 'INSERT', NEW.id, to_jsonb(NEW), NEW.criado_por);

  ELSIF TG_OP = 'UPDATE' THEN
    -- ignora updates sem mudança real nos campos relevantes
    IF (OLD.data_hora_inicio, OLD.data_hora_fim, OLD.descricao, OLD.observacoes)
       IS NOT DISTINCT FROM
       (NEW.data_hora_inicio, NEW.data_hora_fim, NEW.descricao, NEW.observacoes)
    THEN
      RETURN NEW;
    END IF;
    INSERT INTO public.chamadas_audit_log
      (entidade, operation, chamada_id, old_data, new_data, user_id)
    VALUES ('chamada', 'UPDATE', NEW.id, to_jsonb(OLD), to_jsonb(NEW), NEW.atualizado_por);

  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.chamadas_audit_log
      (entidade, operation, chamada_id, old_data, user_id)
    VALUES ('chamada', 'DELETE', OLD.id, to_jsonb(OLD), auth.uid());
  END IF;
  RETURN coalesce(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_chamadas_audit ON public.chamadas;
CREATE TRIGGER trg_chamadas_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.chamadas
  FOR EACH ROW EXECUTE FUNCTION public.fn_chamadas_audit();

-- 6. Função de trigger para chamada_presencas
CREATE OR REPLACE FUNCTION public.fn_chamada_presencas_audit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.chamadas_audit_log
      (entidade, operation, chamada_id, atleta_id, new_data, user_id)
    VALUES ('presenca', 'INSERT', NEW.chamada_id, NEW.atleta_id, to_jsonb(NEW), NEW.registrado_por);

  ELSIF TG_OP = 'UPDATE' THEN
    -- ignora se status não mudou
    IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
      RETURN NEW;
    END IF;
    INSERT INTO public.chamadas_audit_log
      (entidade, operation, chamada_id, atleta_id, old_data, new_data, user_id)
    VALUES ('presenca', 'UPDATE', NEW.chamada_id, NEW.atleta_id, to_jsonb(OLD), to_jsonb(NEW), NEW.registrado_por);

  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.chamadas_audit_log
      (entidade, operation, chamada_id, atleta_id, old_data, user_id)
    VALUES ('presenca', 'DELETE', OLD.chamada_id, OLD.atleta_id, to_jsonb(OLD), OLD.registrado_por);
  END IF;
  RETURN coalesce(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_chamada_presencas_audit ON public.chamada_presencas;
CREATE TRIGGER trg_chamada_presencas_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.chamada_presencas
  FOR EACH ROW EXECUTE FUNCTION public.fn_chamada_presencas_audit();

-- 7. RLS DELETE para chamadas (somente Organizadores/Admins/Mestres)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chamadas'
      AND policyname = 'chamadas_delete_admins'
  ) THEN
    CREATE POLICY "chamadas_delete_admins"
      ON public.chamadas FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.papeis_usuarios pu
          JOIN public.perfis p       ON pu.perfil_id      = p.id
          JOIN public.perfis_tipo pt ON p.perfil_tipo_id  = pt.id
          WHERE pu.usuario_id = auth.uid()
            AND pt.codigo IN ('ORG', 'ADM', 'MST')
        )
      );
  END IF;
END$$;

GRANT DELETE ON public.chamadas TO authenticated;
