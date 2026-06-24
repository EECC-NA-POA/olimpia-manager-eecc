-- Permite leitura de chamadas e presenças para todos os usuários autenticados.
-- Necessário para: aba Frequência do Organizador, visualização de chamadas pelo
-- Organizador na tela Filósofo Monitor, e exibição de presenças ao abrir uma chamada.
-- A UI já é protegida por controle de papel (role-based routing).

-- chamadas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chamadas'
      AND policyname = 'chamadas_select_authenticated'
  ) THEN
    CREATE POLICY "chamadas_select_authenticated"
    ON public.chamadas FOR SELECT TO authenticated
    USING (true);
  END IF;
END$$;

GRANT SELECT ON public.chamadas TO authenticated;

-- chamada_presencas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chamada_presencas'
      AND policyname = 'chamada_presencas_select_authenticated'
  ) THEN
    CREATE POLICY "chamada_presencas_select_authenticated"
    ON public.chamada_presencas FOR SELECT TO authenticated
    USING (true);
  END IF;
END$$;

GRANT SELECT ON public.chamada_presencas TO authenticated;
