-- Adiciona filtro por evento_id à função atualizar_status_pagamento.
-- Sem esse filtro, confirmar pagamento em um evento confirmava TODOS os eventos do atleta.

CREATE OR REPLACE FUNCTION public.atualizar_status_pagamento(
  p_atleta_id uuid,
  p_novo_status text,
  p_evento_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.pagamentos
  SET
    status = p_novo_status,
    data_validacao = CASE
      WHEN p_novo_status = 'confirmado' THEN NOW()
      ELSE NULL
    END
  WHERE atleta_id = p_atleta_id
    AND evento_id = p_evento_id;
END;
$$;
