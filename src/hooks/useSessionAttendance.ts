
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface SessionAttendance {
  id: number;
  chamada_id: number;
  atleta_id: string;
  status: 'presente' | 'ausente' | 'atrasado';
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  atleta: {
    nome_completo: string;
    email: string;
    numero_identificador: string | null;
  };
}

export interface AthleteForAttendance {
  id: string;
  nome_completo: string;
  email: string;
  numero_identificador: string | null;
  status?: 'presente' | 'ausente' | 'atrasado';
  observacoes?: string;
  attendance_id?: number;
}

export const useSessionAttendance = (chamadaId: number | null) => {
  return useQuery({
    queryKey: ['session-attendance', chamadaId],
    queryFn: async () => {
      if (!chamadaId) return [];
      
      console.log('Fetching session attendance for chamada_id:', chamadaId);
      
      const { data, error } = await supabase
        .from('chamada_presencas')
        .select(`
          id,
          chamada_id,
          atleta_id,
          status,
          observacoes,
          created_at,
          updated_at,
          atleta:usuarios!inner (
            nome_completo,
            email,
            numero_identificador
          )
        `)
        .eq('chamada_id', chamadaId);

      if (error) {
        console.error('Error fetching session attendance:', error);
        throw error;
      }

      console.log('Session attendance data:', data);
      
      // Transform the data to match our interface
      const transformedData = data?.map(item => ({
        ...item,
        atleta: Array.isArray(item.atleta) ? item.atleta[0] : item.atleta
      })) || [];

      return transformedData as SessionAttendance[];
    },
    enabled: !!chamadaId,
  });
};

export const useAthletesForAttendance = (modalidadeRepId: number | null) => {
  return useQuery({
    queryKey: ['athletes-for-attendance', modalidadeRepId],
    queryFn: async () => {
      if (!modalidadeRepId) return [];
      
      console.log('Fetching athletes for attendance, modalidade_rep_id:', modalidadeRepId);
      
      // Primeiro buscar a modalidade e filial do representante
      const { data: repData, error: repError } = await supabase
        .from('modalidade_representantes')
        .select('modalidade_id, filial_id, evento_id')
        .eq('id', modalidadeRepId)
        .single();

      if (repError) {
        console.error('Error fetching representative data:', repError);
        throw repError;
      }

      // Buscar atletas inscritos na modalidade e filial
      const { data, error } = await supabase
        .from('inscricoes_modalidades')
        .select(`
          atleta_id,
          usuarios!inner (
            id,
            nome_completo,
            email,
            numero_identificador
          )
        `)
        .eq('modalidade_id', repData.modalidade_id)
        .eq('evento_id', repData.evento_id)
        .eq('status', 'confirmado');

      if (error) {
        console.error('Error fetching athletes for attendance:', error);
        throw error;
      }

      const athletes = data?.map(item => {
        const usuario = Array.isArray(item.usuarios) ? item.usuarios[0] : item.usuarios;
        return {
          id: usuario.id,
          nome_completo: usuario.nome_completo,
          email: usuario.email,
          numero_identificador: usuario.numero_identificador,
        };
      }) || [];

      console.log('Athletes for attendance:', athletes);
      return athletes as AthleteForAttendance[];
    },
    enabled: !!modalidadeRepId,
  });
};
