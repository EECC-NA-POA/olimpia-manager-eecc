-- Limpeza de flags de isenção dessincronizadas no evento 1a9e71ee (decisão do
-- organizador: ninguém é isento nesse evento, todos pagantes).
--
-- Contexto: 9 registros tinham isento=true com status <> 'isento' (dado legado);
-- a lista de atletas tratava a flag como "Confirmado" e escondia 8 pendentes.
-- Outros 2 registros estavam com status='isento' e valor zerado.
--
-- EXECUTAR MANUALMENTE no SQL Editor de sb.nova-acropole.org.br.

-- 1. Flags órfãs (8 pendentes + 1 confirmado): limpa a flag, mantém o status
UPDATE public.pagamentos
SET isento = false
WHERE evento_id = '1a9e71ee-5127-4d65-a83e-2f058446286b'
  AND isento = true
  AND status <> 'isento';

-- 2. Os 2 com status='isento': voltam a pendente com valor restaurado da taxa
UPDATE public.pagamentos p
SET isento = false,
    status = 'pendente',
    valor = t.valor
FROM public.taxas_inscricao t
WHERE t.id = p.taxa_inscricao_id
  AND p.evento_id = '1a9e71ee-5127-4d65-a83e-2f058446286b'
  AND p.status = 'isento';

-- Conferência: deve retornar 12 confirmado / 13 pendente e nenhum isento
SELECT status, count(*), sum(valor) AS valor_total
FROM public.pagamentos
WHERE evento_id = '1a9e71ee-5127-4d65-a83e-2f058446286b'
GROUP BY status;
