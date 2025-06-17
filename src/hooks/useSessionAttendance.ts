
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
  chamada?: {
    id: string;
    descricao: string;
    data_hora_inicio: string;
    data_hora_fim: string | null;
    observacoes: string | null;
    modalidade_representantes: {
      modalidades: {
        nome: string;
      };
      filiais: {
        nome: string;
      };
    };
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
          atleta:atleta_id!inner (
            nome_completo,
            email
          ),
          chamada:chamada_id!inner (
            id,
            descricao,
            data_hora_inicio,
            data_hora_fim,
            observacoes,
            modalidade_representantes:modalidade_rep_id!inner (
              modalidades:modalidade_id!inner (nome),
              filiais:filial_id!inner (nome)
            )
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
        const transformedData = data.map(item => {
          const pagamento = pagamentosData?.find(p => p.atleta_id === item.atleta_id);
          
          return {
            ...item,
            atleta: {
              nome_completo: item.atleta?.nome_completo || '',
              email: item.atleta?.email || '',
              numero_identificador: pagamento?.numero_identificador || null
            },
            chamada: item.chamada ? {
              id: item.chamada.id,
              descricao: item.chamada.descricao,
              data_hora_inicio: item.chamada.data_hora_inicio,
              data_hora_fim: item.chamada.data_hora_fim,
              observacoes: item.chamada.observacoes,
              modalidade_representantes: {
                modalidades: {
                  nome: item.chamada.modalidade_representantes?.modalidades?.nome || ''
                },
                filiais: {
                  nome: item.chamada.modalidade_representantes?.filiais?.nome || ''
                }
              }
            } : undefined
          };
        });

        return transformedData as SessionAttendance[];
      }

      // Se não há dados ou currentEventId, retornar sem numero_identificador
      const transformedData = data?.map(item => ({
        ...item,
        atleta: {
          nome_completo: item.atleta?.nome_completo || '',
          email: item.atleta?.email || '',
          numero_identificador: null
        },
        chamada: item.chamada ? {
          id: item.chamada.id,
          descricao: item.chamada.descricao,
          data_hora_inicio: item.chamada.data_hora_inicio,
          data_hora_fim: item.chamada.data_hora_fim,
          observacoes: item.chamada.observacoes,
          modalidade_representantes: {
            modalidades: {
              nome: item.chamada.modalidade_representantes?.modalidades?.nome || ''
            },
            filiais: {
              nome: item.chamada.modalidade_representantes?.filiais?.nome || ''
            }
          }
        } : undefined
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
          atleta:atleta_id!inner (
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

      // Buscar dados de pagamento separadamente usando atleta_id
      const atletaIds = inscricoesData.map(item => item.atleta_id);
      const { data: pagamentosData } = await supabase
        .from('pagamentos')
        .select('atleta_id, numero_identificador')
        .in('atleta_id', atletaIds)
        .eq('evento_id', currentEventId);

      const athletes = inscricoesData.map(item => {
        const pagamento = pagamentosData?.find(p => p.atleta_id === item.atleta_id);
        
        return {
          id: item.atleta?.id || '',
          nome_completo: item.atleta?.nome_completo || '',
          email: item.atleta?.email || '',
          numero_identificador: pagamento?.numero_identificador || null,
        };
      });

      console.log('Athletes for attendance:', athletes);
      return athletes as AthleteForAttendance[];
    },
    enabled: !!modalidadeRepId && !!currentEventId,
  });
};
