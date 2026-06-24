-- Remove cascata de pagamento → inscricoes_modalidades.
-- A RPC original atualizava todas as modalidades do atleta junto com o pagamento,
-- mas cada modalidade deve ter seu status gerenciado individualmente.

CREATE OR REPLACE FUNCTION public.atualizar_status_pagamento(
  p_atleta_id uuid,
  p_novo_status text
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.pagamentos
    SET status = p_novo_status,
        data_validacao = CASE
            WHEN p_novo_status = 'confirmado' THEN NOW()
            ELSE NULL
        END
    WHERE atleta_id = p_atleta_id;
END;
$$;
