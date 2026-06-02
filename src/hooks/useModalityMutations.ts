
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

export const useModalityMutations = (userId: string | undefined, eventId: string | null) => {
  const queryClient = useQueryClient();

  const withdrawMutation = useMutation({
    mutationFn: async ({
      inscricaoId,
      justificativa,
      modalityName,
      athleteName,
    }: {
      inscricaoId: number;
      justificativa: string;
      modalityName: string;
      athleteName: string;
    }) => {
      if (!userId || !eventId) throw new Error('User not authenticated');

      // 1. Cancela a inscrição
      const { error } = await supabase
        .from('inscricoes_modalidades')
        .update({ status: 'cancelado', justificativa_status: justificativa })
        .eq('id', inscricaoId);
      if (error) throw error;

      // 2. Cria notificação automática para organizador e delegação
      const titulo = `Desistência: ${athleteName} — ${modalityName}`;
      const mensagem = `<p>O atleta <strong>${athleteName}</strong> desistiu da modalidade <strong>${modalityName}</strong>.</p><p><strong>Justificativa:</strong></p><p>${justificativa}</p>`;

      const { data: notif, error: notifError } = await supabase
        .from('notificacoes')
        .insert({
          evento_id: eventId,
          autor_id: userId,
          tipo_autor: 'atleta',
          titulo,
          mensagem,
          visivel: true,
        })
        .select('id')
        .single();

      if (notifError) {
        console.error('Error creating withdrawal notification:', notifError);
        // Não lança erro — a desistência já foi gravada com sucesso
        return;
      }

      // Destinatário: filial_id = null → visível a todos os gestores (org + delegação)
      await supabase
        .from('notificacao_destinatarios')
        .insert({ notificacao_id: notif.id, filial_id: null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-modalities'] });
      queryClient.invalidateQueries({ queryKey: ['modalities'] });
      queryClient.invalidateQueries({ queryKey: ['available-modalities-athlete'] });
      queryClient.invalidateQueries({ queryKey: ['personal-schedule-activities'] });
      toast({
        title: "Desistência confirmada",
        description: "Você desistiu da modalidade com sucesso.",
        variant: "success"
      });
    },
    onError: (error) => {
      console.error('Error withdrawing from modality:', error);
      toast({
        title: "Erro ao desistir",
        description: "Não foi possível processar sua desistência. Tente novamente.",
        variant: "destructive"
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (modalityId: number) => {
      if (!userId || !eventId) throw new Error('User not authenticated or no event selected');
      console.log('Registering for modality:', modalityId);
      
      const { error } = await supabase
        .from('inscricoes_modalidades')
        .insert([{
          atleta_id: userId,
          modalidade_id: modalityId,
          evento_id: eventId,
          status: 'pendente',
          data_inscricao: new Date().toISOString()
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-modalities'] });
      queryClient.invalidateQueries({ queryKey: ['modalities'] });
      queryClient.invalidateQueries({ queryKey: ['available-modalities-athlete'] });
      queryClient.invalidateQueries({ queryKey: ['personal-schedule-activities'] });
      toast({
        title: "Inscrição realizada",
        description: "Você se inscreveu na modalidade com sucesso.",
        variant: "success"
      });
    },
    onError: (error) => {
      console.error('Error registering for modality:', error);
      toast({
        title: "Erro na inscrição",
        description: "Não foi possível processar sua inscrição. Tente novamente.",
        variant: "destructive"
      });
    },
  });

  return { withdrawMutation, registerMutation };
};
