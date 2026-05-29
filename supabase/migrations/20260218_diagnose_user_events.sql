-- DIAGNÓSTICO: EVENTOS E INSCRIÇÕES
-- Objetivo: Ver o que o usuário deveria ver na lista de eventos.

-- 1. Ver inscrições do usuário
SELECT 
    ie.usuario_id,
    ie.evento_id,
    ie.selected_role,
    e.nome as nome_evento,
    e.status_evento
FROM public.inscricoes_eventos ie
JOIN public.eventos e ON ie.evento_id = e.id
WHERE ie.usuario_id = 'ae8c6190-b47f-4a4d-b140-ab3ba2c443f0';

-- 2. Ver eventos ativos disponíveis (tab "Disponíveis")
SELECT id, nome, status_evento
FROM public.eventos
WHERE status_evento = 'ativo';

-- 3. Checar RLS em inscricoes_eventos
SELECT count(*) FROM public.inscricoes_eventos;

-- 4. Checar se a coluna selected_role existe de fato
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'inscricoes_eventos';
