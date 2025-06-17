
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

// Helper function to safely extract modalidade name
const extractModalidadeName = (modalidadeRepresentantes: any): string => {
  if (!modalidadeRepresentantes) return '';
  
  if (Array.isArray(modalidadeRepresentantes)) {
    const first = modalidadeRepresentantes[0];
    if (!first) return '';
    
    if (Array.isArray(first.modalidades)) {
      return first.modalidades[0]?.nome || '';
    }
    return first.modalidades?.nome || '';
  }
  
  if (Array.isArray(modalidadeRepresentantes.modalidades)) {
    return modalidadeRepresentantes.modalidades[0]?.nome || '';
  }
  
  return modalidadeRepresentantes.modalidades?.nome || '';
};

// Helper function to safely extract filial name
const extractFilialName = (modalidadeRepresentantes: any): string => {
  if (!modalidadeRepresentantes) return '';
  
  if (Array.isArray(modalidadeRepresentantes)) {
    const first = modalidadeRepresentantes[0];
    if (!first) return '';
    
    if (Array.isArray(first.filiais)) {
      return first.filiais[0]?.nome || '';
    }
    return first.filiais?.nome || '';
  }
  
  if (Array.isArray(modalidadeRepresentantes.filiais)) {
    return modalidadeRepresentantes.filiais[0]?.nome || '';
  }
  
  return modalidadeRepresentantes.filiais?.nome || '';
};

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
          atletas!inner (
            nome_completo,
            email
          ),
          chamadas!inner (
            id,
            descricao,
            data_hora_inicio,
            data_hora_fim,
            observacoes,
            modalidade_representantes!inner (
              modalidades!inner (nome),
              filiais!inner (nome)
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
          // Safely extract athlete data
          const atletaData = Array.isArray(item.atletas) ? item.atletas[0] : item.atletas;
          // Safely extract chamada data
          const chamadaData = Array.isArray(item.chamadas) ? item.chamadas[0] : item.chamadas;
          
          return {
            ...item,
            atleta: {
              nome_completo: atletaData?.nome_completo || '',
              email: atletaData?.email || '',
              numero_identificador: pagamento?.numero_identificador || null
            },
            chamada: chamadaData ? {
              id: chamadaData.id,
              descricao: chamadaData.descricao,
              data_hora_inicio: chamadaData.data_hora_inicio,
              data_hora_fim: chamadaData.data_hora_fim,
              observacoes: chamadaData.observacoes,
              modalidade_representantes: {
                modalidades: {
                  nome: extractModalidadeName(chamadaData.modalidade_representantes)
                },
                filiais: {
                  nome: extractFilialName(chamadaData.modalidade_representantes)
                }
              }
            } : undefined
          };
        });

        return transformedData as SessionAttendance[];
      }

      // Se não há dados ou currentEventId, retornar sem numero_identificador
      const transformedData = data?.map(item => {
        // Safely extract athlete data
        const atletaData = Array.isArray(item.atletas) ? item.atletas[0] : item.atletas;
        // Safely extract chamada data
        const chamadaData = Array.isArray(item.chamadas) ? item.chamadas[0] : item.chamadas;
        
        return {
          ...item,
          atleta: {
            nome_completo: atletaData?.nome_completo || '',
            email: atletaData?.email || '',
            numero_identificador: null
          },
          chamada: chamadaData ? {
            id: chamadaData.id,
            descricao: chamadaData.descricao,
            data_hora_inicio: chamadaData.data_hora_inicio,
            data_hora_fim: chamadaData.data_hora_fim,
            observacoes: chamadaData.observacoes,
            modalidade_representantes: {
              modalidades: {
                nome: extractModalidadeName(chamadaData.modalidade_representantes)
              },
              filiais: {
                nome: extractFilialName(chamadaData.modalidade_representantes)
              }
            }
          } : undefined
        };
      }) || [];

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
          atletas!inner (
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
        // Safely extract athlete data
        const atletaData = Array.isArray(item.atletas) ? item.atletas[0] : item.atletas;
        
        return {
          id: atletaData?.id || '',
          nome_completo: atletaData?.nome_completo || '',
          email: atletaData?.email || '',
          numero_identificador: pagamento?.numero_identificador || null,
        };
      });

      console.log('Athletes for attendance:', athletes);
      return athletes as AthleteForAttendance[];
    },
    enabled: !!modalidadeRepId && !!currentEventId,
  });
};
