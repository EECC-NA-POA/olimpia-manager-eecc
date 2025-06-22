
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface SessionAttendance {
  id: string;
  chamada_id: string;
  atleta_id: string;
  status: 'presente' | 'ausente' | 'atrasado';
  registrado_por: string;
  criado_em: string;
}

export interface AthleteForAttendance {
  id: string;
  nome_completo: string;
  email: string;
  numero_identificador?: string;
}

export const useSessionAttendance = (sessionId: string) => {
  return useQuery({
    queryKey: ['session-attendance', sessionId],
    queryFn: async () => {
      if (!sessionId) {
        console.log('No session ID provided for attendance');
        return [];
      }

      console.log('Fetching session attendance for chamada_id:', sessionId);

      const { data, error } = await supabase
        .from('chamada_presencas')
        .select('*')
        .eq('chamada_id', sessionId);

      if (error) {
        console.error('Error fetching session attendance:', error);
        throw error;
      }

      console.log('Session attendance data:', data);
      return data as SessionAttendance[];
    },
    enabled: !!sessionId,
  });
};

export const useAthletesForAttendance = (modalidadeRepId: string | null) => {
  const { currentEventId } = useAuth();

  return useQuery({
    queryKey: ['athletes-for-attendance', modalidadeRepId, currentEventId],
    queryFn: async () => {
      if (!modalidadeRepId || !currentEventId) {
        console.log('Missing modalidadeRepId or currentEventId for athletes fetch');
        return [];
      }

      console.log('Fetching athletes for modality rep:', modalidadeRepId);
      console.log('Current event ID:', currentEventId);

      // Primeiro, buscar informações da modalidade
      const { data: modalidadeRepData, error: modalidadeRepError } = await supabase
        .from('modalidade_representantes')
        .select('modalidade_id')
        .eq('id', modalidadeRepId)
        .single();

      if (modalidadeRepError) {
        console.error('Error fetching modalidade rep data:', modalidadeRepError);
        throw modalidadeRepError;
      }

      if (!modalidadeRepData) {
        console.log('No modalidade rep data found');
        return [];
      }

      console.log('Found modalidade_id:', modalidadeRepData.modalidade_id);

      // Buscar atletas inscritos nesta modalidade
      const { data: athletesData, error: athletesError } = await supabase
        .from('inscricoes_modalidades')
        .select(`
          atleta_id,
          usuarios!inner (
            id,
            nome_completo,
            email
          )
        `)
        .eq('modalidade_id', modalidadeRepData.modalidade_id)
        .eq('evento_id', currentEventId)
        .eq('status', 'confirmado');

      if (athletesError) {
        console.error('Error fetching athletes data:', athletesError);
        throw athletesError;
      }

      console.log('Athletes data fetched:', athletesData);

      if (!athletesData || athletesData.length === 0) {
        console.log('No athletes found for this modality');
        return [];
      }

      // Buscar números identificadores dos atletas
      const athleteIds = athletesData.map(item => item.atleta_id);
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('pagamentos')
        .select('atleta_id, numero_identificador')
        .in('atleta_id', athleteIds);

      if (paymentsError) {
        console.log('Error fetching payment data (not critical):', paymentsError);
      }

      // Criar mapa de números identificadores
      const paymentMap = new Map();
      paymentsData?.forEach(payment => {
        paymentMap.set(payment.atleta_id, payment.numero_identificador);
      });

      // Transformar dados para o formato esperado
      const transformedAthletes = athletesData.map(item => {
        const userData = Array.isArray(item.usuarios) ? item.usuarios[0] : item.usuarios;
        return {
          id: item.atleta_id,
          nome_completo: userData.nome_completo,
          email: userData.email,
          numero_identificador: paymentMap.get(item.atleta_id)
        } as AthleteForAttendance;
      });

      console.log('Transformed athletes for attendance:', transformedAthletes);
      return transformedAthletes;
    },
    enabled: !!modalidadeRepId && !!currentEventId,
  });
};
