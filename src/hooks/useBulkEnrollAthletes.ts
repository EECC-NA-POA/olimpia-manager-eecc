import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { EnrollmentType } from './useEnrollAthleteInModality';

interface BulkEnrollParams {
  athleteIds: string[];
  modalityId: number;
  eventId: string;
  enrolledBy: string;
  enrollmentType: EnrollmentType;
}

export function useBulkEnrollAthletes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ athleteIds, modalityId, eventId, enrolledBy, enrollmentType }: BulkEnrollParams) => {
      const rows = athleteIds.map(athleteId => ({
        atleta_id: athleteId,
        modalidade_id: modalityId,
        evento_id: eventId,
        status: 'confirmado',
        data_inscricao: new Date().toISOString(),
        inscrito_por: enrolledBy,
        tipo_inscricao: enrollmentType,
      }));

      const { error } = await supabase
        .from('inscricoes_modalidades')
        .insert(rows);

      if (error) throw error;
    },
    onSuccess: (_, { athleteIds }) => {
      queryClient.invalidateQueries({ queryKey: ['athlete-modalities'] });
      queryClient.invalidateQueries({ queryKey: ['athlete-management'] });
      queryClient.invalidateQueries({ queryKey: ['available-modalities-athlete'] });
      queryClient.invalidateQueries({ queryKey: ['branch-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['confirmed-enrollments'] });
      toast.success(`${athleteIds.length} atleta(s) inscrito(s) com sucesso!`);
    },
    onError: (error: any) => {
      if (error?.code === '23505') {
        toast.error('Alguns atletas já estão inscritos nesta modalidade.');
      } else {
        toast.error('Erro ao inscrever atletas.');
      }
    },
  });
}
