-- Garante a invariante "1 pagamento por atleta/evento".
--
-- Motivo: a view vw_analytics_inscricoes soma valor dos confirmados sem dedupe
-- por atleta; sem constraint, uma linha duplicada contaria em dobro no Total Pago.
-- Esta migração remove eventuais duplicatas e impede novas.
--
-- EXECUTAR MANUALMENTE no SQL Editor de sb.nova-acropole.org.br.

-- 1. Dedupe: mantém 1 linha por (atleta_id, evento_id).
--    Prioridade: confirmado > isento > pendente > cancelado; empate → mais recente.
WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY atleta_id, evento_id
      ORDER BY
        CASE status
          WHEN 'confirmado' THEN 0
          WHEN 'isento'     THEN 1
          WHEN 'pendente'   THEN 2
          WHEN 'cancelado'  THEN 3
          ELSE 4
        END,
        data_criacao DESC NULLS LAST,
        id DESC
    ) AS rn
  FROM public.pagamentos
)
DELETE FROM public.pagamentos p
USING ranked r
WHERE p.id = r.id
  AND r.rn > 1;

-- 2. Constraint única (reexecutável)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pagamentos_atleta_evento_unico'
  ) THEN
    ALTER TABLE public.pagamentos
      ADD CONSTRAINT pagamentos_atleta_evento_unico UNIQUE (atleta_id, evento_id);
  END IF;
END$$;

-- 3. Conferência: deve retornar 0 linhas
SELECT atleta_id, evento_id, count(*)
FROM public.pagamentos
GROUP BY atleta_id, evento_id
HAVING count(*) > 1;
