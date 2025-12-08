import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export type EnrollmentType = 'organizador' | 'delegacao';

interface EnrollAthleteParams {
  athleteId: string;
  modalityId: number;
  eventId: string;
  enrolledBy: string;
  enrollmentType: EnrollmentType;
}

export function useEnrollAthleteInModality() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ athleteId, modalityId, eventId, enrolledBy, enrollmentType }: EnrollAthleteParams) => {
      console.log('Enrolling athlete in modality:', { athleteId, modalityId, eventId, enrolledBy, enrollmentType });
      
      const { error } = await supabase
        .from('inscricoes_modalidades')
        .insert([{
          atleta_id: athleteId,
          modalidade_id: modalityId,
          evento_id: eventId,
          status: 'pendente',
          data_inscricao: new Date().toISOString(),
          inscrito_por: enrolledBy,
          tipo_inscricao: enrollmentType
        }]);
      
      if (error) {
        console.error('Error enrolling athlete:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-modalities'] });
      queryClient.invalidateQueries({ queryKey: ['athlete-management'] });
      queryClient.invalidateQueries({ queryKey: ['available-modalities-athlete'] });
      queryClient.invalidateQueries({ queryKey: ['branch-analytics'] });
      toast.success("Atleta inscrito na modalidade com sucesso!");
    },
    onError: (error: any) => {
      console.error('Error enrolling athlete in modality:', error);
      if (error?.code === '23505') {
        toast.error("Este atleta já está inscrito nesta modalidade.");
      } else {
        toast.error("Erro ao inscrever atleta na modalidade.");
      }
    },
  });
}
