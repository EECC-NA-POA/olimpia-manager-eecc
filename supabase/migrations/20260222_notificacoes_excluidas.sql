-- 20260222_notificacoes_excluidas.sql

-- Criar tabela para armazenar registro de quais usuários ocultaram (excluíram) quais notificações
CREATE TABLE IF NOT EXISTS public.notificacoes_excluidas (
    notificacao_id UUID NOT NULL REFERENCES public.notificacoes(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    excluido_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (notificacao_id, usuario_id)
);

-- Ativar RLS
ALTER TABLE public.notificacoes_excluidas ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
-- O usuário pode ver apenas suas próprias exclusões
CREATE POLICY "Usuários podem ver suas próprias exclusões" 
    ON public.notificacoes_excluidas FOR SELECT 
    USING (auth.uid() = usuario_id);

-- O usuário pode inserir sua própria exclusão
CREATE POLICY "Usuários podem inserir exclusões para si mesmos" 
    ON public.notificacoes_excluidas FOR INSERT 
    WITH CHECK (auth.uid() = usuario_id);

-- O usuário pode remover sua própria exclusão (se quiser desfazer)
CREATE POLICY "Usuários podem remover suas próprias exclusões" 
    ON public.notificacoes_excluidas FOR DELETE 
    USING (auth.uid() = usuario_id);

-- Adicionar comentários
COMMENT ON TABLE public.notificacoes_excluidas IS 'Registra quais notificações os usuários optaram por ocultar/excluir de sua visão pessoal na caixa de entrada';
