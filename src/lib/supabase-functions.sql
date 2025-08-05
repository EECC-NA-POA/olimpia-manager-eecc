
-- ... keep existing code (verification functions and policies) the same ...

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

-- Função para verificar se o usuário tem permissão administrativa em um evento
CREATE OR REPLACE FUNCTION public.verificar_permissao_admin_evento(evento_id_param uuid)
RETURNS boolean AS $$
BEGIN
  -- Verifica se o usuário tem perfil de Administração no evento
  RETURN EXISTS (
    SELECT 1
    FROM public.papeis_usuarios pu
    JOIN public.perfis p ON p.id = pu.perfil_id
    WHERE pu.usuario_id = auth.uid()
      AND pu.evento_id = evento_id_param
      AND p.nome = 'Administração'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop e recria a função RPC para criar cronograma (corrige tipo de retorno)
DROP FUNCTION IF EXISTS public.create_cronograma_for_event(uuid, text);

CREATE OR REPLACE FUNCTION public.create_cronograma_for_event(
  p_evento_id uuid,
  p_nome text
)
RETURNS integer AS $$
DECLARE
  cronograma_id integer;
BEGIN
  -- Verifica se o usuário tem permissão administrativa no evento
  IF NOT public.verificar_permissao_admin_evento(p_evento_id) THEN
    RAISE EXCEPTION 'Acesso negado: usuário não tem permissão administrativa para este evento';
  END IF;
  
  -- Insere o novo cronograma
  INSERT INTO public.cronogramas (nome, evento_id)
  VALUES (p_nome, p_evento_id)
  RETURNING id INTO cronograma_id;
  
  RETURN cronograma_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========== ALTERAÇÕES NA TABELA CRONOGRAMA_ATIVIDADES ==========
-- Remove constraints NOT NULL para permitir atividades recorrentes

ALTER TABLE public.cronograma_atividades 
ALTER COLUMN horario_inicio DROP NOT NULL;

ALTER TABLE public.cronograma_atividades 
ALTER COLUMN horario_fim DROP NOT NULL;

ALTER TABLE public.cronograma_atividades 
ALTER COLUMN local DROP NOT NULL;

ALTER TABLE public.cronograma_atividades 
ALTER COLUMN dia DROP NOT NULL;

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

-- ========== POLÍTICAS PARA CRONOGRAMA_ATIVIDADES ==========

-- Habilitar RLS para cronograma_atividades
ALTER TABLE public.cronograma_atividades ENABLE ROW LEVEL SECURITY;

-- Remover policies existentes se houver
DROP POLICY IF EXISTS cronograma_atividades_select_policy ON public.cronograma_atividades;
DROP POLICY IF EXISTS cronograma_atividades_insert_policy ON public.cronograma_atividades;
DROP POLICY IF EXISTS cronograma_atividades_update_policy ON public.cronograma_atividades;
DROP POLICY IF EXISTS cronograma_atividades_delete_policy ON public.cronograma_atividades;

-- Política de SELECT: Usuários podem ver atividades de eventos que participam
CREATE POLICY cronograma_atividades_select_policy
  ON public.cronograma_atividades
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.papeis_usuarios pu
      WHERE pu.usuario_id = auth.uid()
        AND pu.evento_id = cronograma_atividades.evento_id
    )
  );

-- Política de INSERT: Usuários com permissão administrativa ou monitores podem criar atividades
CREATE POLICY cronograma_atividades_insert_policy
  ON public.cronograma_atividades
  FOR INSERT
  WITH CHECK (
    public.verificar_permissao_admin_evento(evento_id) OR public.usuario_e_monitor()
  );

-- Política de UPDATE: Usuários com permissão administrativa ou monitores podem editar atividades
CREATE POLICY cronograma_atividades_update_policy
  ON public.cronograma_atividades
  FOR UPDATE
  USING (
    public.verificar_permissao_admin_evento(evento_id) OR public.usuario_e_monitor()
  )
  WITH CHECK (
    public.verificar_permissao_admin_evento(evento_id) OR public.usuario_e_monitor()
  );

-- Política de DELETE: Usuários com permissão administrativa ou monitores podem excluir atividades
CREATE POLICY cronograma_atividades_delete_policy
  ON public.cronograma_atividades
  FOR DELETE
  USING (
    public.verificar_permissao_admin_evento(evento_id) OR public.usuario_e_monitor()
  );

-- ========== POLÍTICAS PARA CRONOGRAMA_ATIVIDADE_MODALIDADES ==========

-- Habilitar RLS para cronograma_atividade_modalidades
ALTER TABLE public.cronograma_atividade_modalidades ENABLE ROW LEVEL SECURITY;

-- Remover policies existentes se houver
DROP POLICY IF EXISTS cronograma_atividade_modalidades_select_policy ON public.cronograma_atividade_modalidades;
DROP POLICY IF EXISTS cronograma_atividade_modalidades_insert_policy ON public.cronograma_atividade_modalidades;
DROP POLICY IF EXISTS cronograma_atividade_modalidades_update_policy ON public.cronograma_atividade_modalidades;
DROP POLICY IF EXISTS cronograma_atividade_modalidades_delete_policy ON public.cronograma_atividade_modalidades;

-- Política de SELECT: Usuários podem ver relacionamentos de atividades de eventos que participam
CREATE POLICY cronograma_atividade_modalidades_select_policy
  ON public.cronograma_atividade_modalidades
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.cronograma_atividades ca
      JOIN public.papeis_usuarios pu ON pu.evento_id = ca.evento_id
      WHERE ca.id = cronograma_atividade_modalidades.cronograma_atividade_id
        AND pu.usuario_id = auth.uid()
    )
  );

-- Política de INSERT: Administradores ou monitores que representam a modalidade podem criar relacionamentos
CREATE POLICY cronograma_atividade_modalidades_insert_policy
  ON public.cronograma_atividade_modalidades
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.cronograma_atividades ca
      WHERE ca.id = cronograma_atividade_modalidades.cronograma_atividade_id
        AND (
          public.verificar_permissao_admin_evento(ca.evento_id)
          OR 
          EXISTS (
            SELECT 1
            FROM public.modalidade_representantes mr
            WHERE mr.modalidade_id = cronograma_atividade_modalidades.modalidade_id
              AND mr.atleta_id = auth.uid()
          )
        )
    )
  );

-- Política de UPDATE: Administradores ou monitores que representam a modalidade podem editar relacionamentos
CREATE POLICY cronograma_atividade_modalidades_update_policy
  ON public.cronograma_atividade_modalidades
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.cronograma_atividades ca
      WHERE ca.id = cronograma_atividade_modalidades.cronograma_atividade_id
        AND (
          public.verificar_permissao_admin_evento(ca.evento_id)
          OR 
          EXISTS (
            SELECT 1
            FROM public.modalidade_representantes mr
            WHERE mr.modalidade_id = cronograma_atividade_modalidades.modalidade_id
              AND mr.atleta_id = auth.uid()
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.cronograma_atividades ca
      WHERE ca.id = cronograma_atividade_modalidades.cronograma_atividade_id
        AND (
          public.verificar_permissao_admin_evento(ca.evento_id)
          OR 
          EXISTS (
            SELECT 1
            FROM public.modalidade_representantes mr
            WHERE mr.modalidade_id = cronograma_atividade_modalidades.modalidade_id
              AND mr.atleta_id = auth.uid()
          )
        )
    )
  );

-- Política de DELETE: Administradores ou monitores que representam a modalidade podem excluir relacionamentos
CREATE POLICY cronograma_atividade_modalidades_delete_policy
  ON public.cronograma_atividade_modalidades
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.cronograma_atividades ca
      WHERE ca.id = cronograma_atividade_modalidades.cronograma_atividade_id
        AND (
          public.verificar_permissao_admin_evento(ca.evento_id)
          OR 
          EXISTS (
            SELECT 1
            FROM public.modalidade_representantes mr
            WHERE mr.modalidade_id = cronograma_atividade_modalidades.modalidade_id
              AND mr.atleta_id = auth.uid()
          )
        )
    )
  );

-- ========== POLÍTICAS PARA CRONOGRAMAS ==========

-- Habilitar RLS para cronogramas
ALTER TABLE public.cronogramas ENABLE ROW LEVEL SECURITY;

-- Remover policies existentes se houver
DROP POLICY IF EXISTS cronogramas_select_policy ON public.cronogramas;
DROP POLICY IF EXISTS cronogramas_insert_policy ON public.cronogramas;
DROP POLICY IF EXISTS cronogramas_update_policy ON public.cronogramas;
DROP POLICY IF EXISTS cronogramas_delete_policy ON public.cronogramas;

-- Política de SELECT: Usuários podem ver cronogramas de eventos que participam
CREATE POLICY cronogramas_select_policy
  ON public.cronogramas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.papeis_usuarios pu
      WHERE pu.usuario_id = auth.uid()
        AND pu.evento_id = cronogramas.evento_id
    )
  );

-- Política de INSERT: Apenas usuários com permissão administrativa podem criar cronogramas
CREATE POLICY cronogramas_insert_policy
  ON public.cronogramas
  FOR INSERT
  WITH CHECK (
    public.verificar_permissao_admin_evento(evento_id)
  );

-- Política de UPDATE: Apenas usuários com permissão administrativa podem editar cronogramas
CREATE POLICY cronogramas_update_policy
  ON public.cronogramas
  FOR UPDATE
  USING (
    public.verificar_permissao_admin_evento(evento_id)
  )
  WITH CHECK (
    public.verificar_permissao_admin_evento(evento_id)
  );

-- Política de DELETE: Apenas usuários com permissão administrativa podem excluir cronogramas
CREATE POLICY cronogramas_delete_policy
  ON public.cronogramas
  FOR DELETE
  USING (
    public.verificar_permissao_admin_evento(evento_id)
  );

-- ========== FIX RLS POLICIES FOR ADMIN ACCESS TO USER DATA ==========

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "usuarios_view_own" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_admin_access" ON public.usuarios;
DROP POLICY IF EXISTS "inscricoes_eventos_admin_access" ON public.inscricoes_eventos;
DROP POLICY IF EXISTS "papeis_usuarios_admin_access" ON public.papeis_usuarios;

-- Create unified policy that allows both self-access and admin access
CREATE POLICY "usuarios_access_unified" 
ON public.usuarios 
FOR SELECT 
USING (
    auth.uid() = id OR  -- Users can see their own data
    EXISTS (
        SELECT 1 
        FROM public.papeis_usuarios pu
        JOIN public.perfis p ON pu.perfil_id = p.id
        WHERE pu.usuario_id = auth.uid() 
        AND p.nome = 'Administração'
        AND pu.evento_id IN (
            SELECT DISTINCT evento_id 
            FROM public.inscricoes_eventos ie 
            WHERE ie.usuario_id = usuarios.id
        )
    )
);

-- Fix inscricoes_eventos table RLS for admins
CREATE POLICY "inscricoes_eventos_admin_access"
ON public.inscricoes_eventos
FOR SELECT
USING (
    usuario_id = auth.uid() OR  -- Users can see their own registrations
    EXISTS (
        SELECT 1 
        FROM public.papeis_usuarios pu
        JOIN public.perfis p ON pu.perfil_id = p.id
        WHERE pu.usuario_id = auth.uid() 
        AND p.nome = 'Administração'
        AND pu.evento_id = inscricoes_eventos.evento_id
    )
);

-- Fix papeis_usuarios table RLS for admins
CREATE POLICY "papeis_usuarios_admin_access"
ON public.papeis_usuarios
FOR SELECT
USING (
    usuario_id = auth.uid() OR  -- Users can see their own roles
    EXISTS (
        SELECT 1 
        FROM public.papeis_usuarios pu2
        JOIN public.perfis p ON pu2.perfil_id = p.id
        WHERE pu2.usuario_id = auth.uid() 
        AND p.nome = 'Administração'
        AND pu2.evento_id = papeis_usuarios.evento_id
    )
);

-- Grant necessário para as funções
GRANT EXECUTE ON FUNCTION public.verificar_permissao_monitor(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verificar_permissao_presenca(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.usuario_e_monitor() TO authenticated;
GRANT EXECUTE ON FUNCTION public.verificar_permissao_admin_evento(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_cronograma_for_event(uuid, text) TO authenticated;
