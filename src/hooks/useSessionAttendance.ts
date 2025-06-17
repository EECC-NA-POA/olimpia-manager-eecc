
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface SessionAttendance {
  id: string;
  chamada_id: string;
  atleta_id: string;
  status: 'presente' | 'ausente' | 'atrasado';
  registrado_em: string;
  registrado_por: string;
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
  attendance_id?: string;
}

export const useSessionAttendance = (chamadaId: string | null) => {
  const { currentEventId } = useAuth();
  
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
          registrado_em,
          registrado_por,
          atleta:usuarios!inner (
            nome_completo,
            email
          )
        `)
        .eq('chamada_id', chamadaId);

      if (error) {
        console.error('Error fetching session attendance:', error);
        throw error;
      }

      console.log('Session attendance data:', data);
      
      // Buscar dados de pagamento para obter numero_identificador
      if (data && data.length > 0 && currentEventId) {
        const atletaIds = data.map(item => item.atleta_id);
        const { data: pagamentosData } = await supabase
          .from('pagamentos')
          .select('atleta_id, numero_identificador')
          .in('atleta_id', atletaIds)
          .eq('evento_id', currentEventId);

        // Transform the data to match our interface
        const transformedData = data?.map(item => {
          const atleta = Array.isArray(item.atleta) ? item.atleta[0] : item.atleta;
          const pagamento = pagamentosData?.find(p => p.atleta_id === item.atleta_id);
          
          return {
            ...item,
            atleta: {
              ...atleta,
              numero_identificador: pagamento?.numero_identificador || null
            }
          };
        }) || [];

        return transformedData as SessionAttendance[];
      }

      // Se não há dados ou currentEventId, retornar sem numero_identificador
      const transformedData = data?.map(item => ({
        ...item,
        atleta: {
          ...(Array.isArray(item.atleta) ? item.atleta[0] : item.atleta),
          numero_identificador: null
        }
      })) || [];

      return transformedData as SessionAttendance[];
    },
    enabled: !!chamadaId,
  });
};

export const useAthletesForAttendance = (modalidadeRepId: string | null) => {
  const { currentEventId } = useAuth();
  
  return useQuery({
    queryKey: ['athletes-for-attendance', modalidadeRepId, currentEventId],
    queryFn: async () => {
      if (!modalidadeRepId || !currentEventId) return [];
      
      console.log('Fetching athletes for attendance, modalidade_rep_id:', modalidadeRepId);
      console.log('Current event ID:', currentEventId);
      
      // Primeiro buscar a modalidade e filial do representante
      const { data: repData, error: repError } = await supabase
        .from('modalidade_representantes')
        .select('modalidade_id, filial_id')
        .eq('id', modalidadeRepId)
        .single();

      if (repError) {
        console.error('Error fetching representative data:', repError);
        throw repError;
      }

      console.log('Representative data:', repData);

      // Buscar atletas inscritos na modalidade
      const { data: inscricoesData, error: inscricoesError } = await supabase
        .from('inscricoes_modalidades')
        .select(`
          atleta_id,
          usuarios!inner (
            id,
            nome_completo,
            email
          )
        `)
        .eq('modalidade_id', repData.modalidade_id)
        .eq('evento_id', currentEventId)
        .eq('status', 'confirmado');

      if (inscricoesError) {
        console.error('Error fetching athletes for attendance:', inscricoesError);
        throw inscricoesError;
      }

      if (!inscricoesData || inscricoesData.length === 0) {
        console.log('No athletes found for attendance');
        return [];
      }

      // Buscar dados de pagamento separadamente
      const atletaIds = inscricoesData.map(item => item.atleta_id);
      const { data: pagamentosData } = await supabase
        .from('pagamentos')
        .select('atleta_id, numero_identificador')
        .in('atleta_id', atletaIds)
        .eq('evento_id', currentEventId);

      const athletes = inscricoesData.map(item => {
        const usuario = Array.isArray(item.usuarios) ? item.usuarios[0] : item.usuarios;
        const pagamento = pagamentosData?.find(p => p.atleta_id === item.atleta_id);
        
        return {
          id: usuario.id,
          nome_completo: usuario.nome_completo,
          email: usuario.email,
          numero_identificador: pagamento?.numero_identificador || null,
        };
      });

      console.log('Athletes for attendance:', athletes);
      return athletes as AthleteForAttendance[];
    },
    enabled: !!modalidadeRepId && !!currentEventId,
  });
};
