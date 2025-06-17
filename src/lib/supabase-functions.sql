
-- Função para verificar se o usuário é monitor de uma modalidade
CREATE OR REPLACE FUNCTION public.verificar_permissao_monitor(modalidade_rep_id_param uuid)
RETURNS boolean AS $$
BEGIN
  -- Verifica se o usuário logado é o monitor da modalidade especificada
  RETURN EXISTS (
    SELECT 1
    FROM public.modalidade_representantes mr
    WHERE mr.id = modalidade_rep_id_param
      AND mr.atleta_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar permissão de registrar presença
CREATE OR REPLACE FUNCTION public.verificar_permissao_presenca(chamada_id_param uuid)
RETURNS boolean AS $$
BEGIN
  -- Verifica se o usuário logado é monitor da modalidade relacionada à chamada
  RETURN EXISTS (
    SELECT 1
    FROM public.chamadas c
    JOIN public.modalidade_representantes mr ON mr.id = c.modalidade_rep_id
    WHERE c.id = chamada_id_param
      AND mr.atleta_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função auxiliar para verificar se o usuário é monitor (genérica)
CREATE OR REPLACE FUNCTION public.usuario_e_monitor()
RETURNS boolean AS $$
BEGIN
  -- Verifica se o usuário tem pelo menos uma modalidade como monitor
  RETURN EXISTS (
    SELECT 1
    FROM public.modalidade_representantes mr
    WHERE mr.atleta_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies para a tabela chamadas
ALTER TABLE public.chamadas ENABLE ROW LEVEL SECURITY;

-- Remover policies existentes se houver
DROP POLICY IF EXISTS chamadas_select_policy ON public.chamadas;
DROP POLICY IF EXISTS chamadas_insert_policy ON public.chamadas;
DROP POLICY IF EXISTS chamadas_update_policy ON public.chamadas;
DROP POLICY IF EXISTS chamadas_delete_policy ON public.chamadas;

-- Política de SELECT: Monitor pode ver suas próprias chamadas
CREATE POLICY chamadas_select_policy
  ON public.chamadas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.modalidade_representantes mr
      WHERE mr.id = chamadas.modalidade_rep_id
        AND mr.atleta_id = auth.uid()
    )
  );

-- Política de INSERT: Monitor pode criar chamadas para suas modalidades
CREATE POLICY chamadas_insert_policy
  ON public.chamadas
  FOR INSERT
  WITH CHECK (
    public.verificar_permissao_monitor(modalidade_rep_id)
    AND criado_por = auth.uid()
  );

-- Política de UPDATE: Monitor pode atualizar suas próprias chamadas
CREATE POLICY chamadas_update_policy
  ON public.chamadas
  FOR UPDATE
  USING (
    public.verificar_permissao_monitor(modalidade_rep_id)
    AND criado_por = auth.uid()
  )
  WITH CHECK (
    public.verificar_permissao_monitor(modalidade_rep_id)
    AND criado_por = auth.uid()
  );

-- Política de DELETE: Monitor pode deletar suas próprias chamadas
CREATE POLICY chamadas_delete_policy
  ON public.chamadas
  FOR DELETE
  USING (
    public.verificar_permissao_monitor(modalidade_rep_id)
    AND criado_por = auth.uid()
  );

-- Policies para a tabela chamada_presencas
ALTER TABLE public.chamada_presencas ENABLE ROW LEVEL SECURITY;

-- Remover policies existentes se houver
DROP POLICY IF EXISTS presencas_select_policy ON public.chamada_presencas;
DROP POLICY IF EXISTS presencas_insert_policy ON public.chamada_presencas;
DROP POLICY IF EXISTS presencas_update_policy ON public.chamada_presencas;
DROP POLICY IF EXISTS presencas_delete_policy ON public.chamada_presencas;

-- Política de SELECT: Monitor pode ver presenças de suas chamadas
CREATE POLICY presencas_select_policy
  ON public.chamada_presencas
  FOR SELECT
  USING (
    public.verificar_permissao_presenca(chamada_id)
  );

-- Política de INSERT: Monitor pode registrar presenças em suas chamadas
CREATE POLICY presencas_insert_policy
  ON public.chamada_presencas
  FOR INSERT
  WITH CHECK (
    public.verificar_permissao_presenca(chamada_id)
    AND registrado_por = auth.uid()
  );

-- Política de UPDATE: Monitor pode atualizar presenças de suas chamadas
CREATE POLICY presencas_update_policy
  ON public.chamada_presencas
  FOR UPDATE
  USING (
    public.verificar_permissao_presenca(chamada_id)
    AND registrado_por = auth.uid()
  )
  WITH CHECK (
    public.verificar_permissao_presenca(chamada_id)
    AND registrado_por = auth.uid()
  );

-- Política de DELETE: Monitor pode deletar presenças de suas chamadas
CREATE POLICY presencas_delete_policy
  ON public.chamada_presencas
  FOR DELETE
  USING (
    public.verificar_permissao_presenca(chamada_id)
    AND registrado_por = auth.uid()
  );

-- Grant necessário para as funções
GRANT EXECUTE ON FUNCTION public.verificar_permissao_monitor(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verificar_permissao_presenca(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.usuario_e_monitor() TO authenticated;
