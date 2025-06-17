
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
          usuarios!chamada_presencas_atleta_id_fkey (
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

      console.log('Session attendance raw data:', data);
      
      if (!data || data.length === 0) {
        console.log('No attendance data found for chamada_id:', chamadaId);
        return [];
      }

      // Buscar dados de pagamento para obter numero_identificador
      const atletaIds = data.map(item => item.atleta_id);
      let pagamentosData = [];
      
      if (currentEventId && atletaIds.length > 0) {
        const { data: pagamentos } = await supabase
          .from('pagamentos')
          .select('atleta_id, numero_identificador')
          .in('atleta_id', atletaIds)
          .eq('evento_id', currentEventId);
        
        pagamentosData = pagamentos || [];
      }

      // Transform the data to match our interface
      const transformedData = data.map(item => {
        const pagamento = pagamentosData.find(p => p.atleta_id === item.atleta_id);
        const atletaData = Array.isArray(item.usuarios) ? item.usuarios[0] : item.usuarios;
        const chamadaData = Array.isArray(item.chamadas) ? item.chamadas[0] : item.chamadas;
        
        return {
          id: item.id,
          chamada_id: item.chamada_id,
          atleta_id: item.atleta_id,
          status: item.status,
          registrado_em: item.registrado_em,
          registrado_por: item.registrado_por,
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
                nome: Array.isArray(chamadaData.modalidade_representantes?.modalidades) 
                  ? chamadaData.modalidade_representantes.modalidades[0]?.nome || ''
                  : chamadaData.modalidade_representantes?.modalidades?.nome || ''
              },
              filiais: {
                nome: Array.isArray(chamadaData.modalidade_representantes?.filiais) 
                  ? chamadaData.modalidade_representantes.filiais[0]?.nome || ''
                  : chamadaData.modalidade_representantes?.filiais?.nome || ''
              }
            }
          } : undefined
        };
      });

      console.log('Transformed attendance data:', transformedData);
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

      // Buscar dados de pagamento separadamente usando atleta_id
      const atletaIds = inscricoesData.map(item => item.atleta_id);
      const { data: pagamentosData } = await supabase
        .from('pagamentos')
        .select('atleta_id, numero_identificador')
        .in('atleta_id', atletaIds)
        .eq('evento_id', currentEventId);

      const athletes = inscricoesData.map(item => {
        const pagamento = pagamentosData?.find(p => p.atleta_id === item.atleta_id);
        const atletaData = Array.isArray(item.usuarios) ? item.usuarios[0] : item.usuarios;
        
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

// Hook para dados de assiduidade por atleta
export const useAttendanceByAthlete = (modalidadeRepId: string | null) => {
  const { currentEventId } = useAuth();
  
  return useQuery({
    queryKey: ['attendance-by-athlete', modalidadeRepId, currentEventId],
    queryFn: async () => {
      if (!modalidadeRepId || !currentEventId) return [];
      
      console.log('Fetching attendance by athlete for modalidade_rep_id:', modalidadeRepId);
      
      // Primeiro buscar a modalidade do representante
      const { data: repData, error: repError } = await supabase
        .from('modalidade_representantes')
        .select('modalidade_id')
        .eq('id', modalidadeRepId)
        .single();

      if (repError) {
        console.error('Error fetching representative data:', repError);
        throw repError;
      }

      // Buscar todas as chamadas e presenças da modalidade
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('chamada_presencas')
        .select(`
          atleta_id,
          status,
          registrado_em,
          chamadas!inner (
            modalidade_rep_id,
            data_hora_inicio
          ),
          usuarios!chamada_presencas_atleta_id_fkey (
            nome_completo
          )
        `)
        .eq('chamadas.modalidade_rep_id', modalidadeRepId);

      if (attendanceError) {
        console.error('Error fetching attendance data:', attendanceError);
        throw attendanceError;
      }

      // Agrupar dados por atleta e mês
      const attendanceByAthlete = attendanceData?.reduce((acc, item) => {
        const atletaData = Array.isArray(item.usuarios) ? item.usuarios[0] : item.usuarios;
        const chamadaData = Array.isArray(item.chamadas) ? item.chamadas[0] : item.chamadas;
        
        const atletaNome = atletaData?.nome_completo || 'Atleta Desconhecido';
        const dataPresenca = new Date(chamadaData?.data_hora_inicio || '');
        const mesAno = `${dataPresenca.getFullYear()}-${String(dataPresenca.getMonth() + 1).padStart(2, '0')}`;
        
        if (!acc[atletaNome]) {
          acc[atletaNome] = {};
        }
        
        if (!acc[atletaNome][mesAno]) {
          acc[atletaNome][mesAno] = {
            presente: 0,
            ausente: 0,
            atrasado: 0,
            total: 0
          };
        }
        
        acc[atletaNome][mesAno][item.status]++;
        acc[atletaNome][mesAno].total++;
        
        return acc;
      }, {} as Record<string, Record<string, { presente: number; ausente: number; atrasado: number; total: number }>>);

      console.log('Attendance by athlete:', attendanceByAthlete);
      return attendanceByAthlete || {};
    },
    enabled: !!modalidadeRepId && !!currentEventId,
  });
};
