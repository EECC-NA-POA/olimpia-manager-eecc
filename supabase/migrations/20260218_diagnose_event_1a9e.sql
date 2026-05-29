-- DIAGNÓSTICO PROFUNDO: EVENTO 1a9e71ee...
-- Objetivo: Entender por que as 6 atividades deste evento não aparecem no App.

SELECT 
    id, 
    atividade, 
    dia, 
    horario_inicio, 
    global, 
    evento_id,
    recorrente,
    dias_semana
FROM public.cronograma_atividades
WHERE evento_id = '1a9e71ee-5127-4d65-a83e-2f058446286b';

-- Ver se o usuário tem inscrição em modalidades deste evento
SELECT count(*) as inscricoes_modalidades
FROM public.inscricoes_modalidades
WHERE evento_id = '1a9e71ee-5127-4d65-a83e-2f058446286b'
AND atleta_id = 'ae8c6190-b47f-4a4d-b140-ab3ba2c443f0';

-- Testar o RPC simulando a chamada do App
SELECT * FROM public.get_schedule(
    '1a9e71ee-5127-4d65-a83e-2f058446286b', 
    'ae8c6190-b47f-4a4d-b140-ab3ba2c443f0'
);
