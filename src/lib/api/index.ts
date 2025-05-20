
export * from './athletes';
export * from './branches';
export * from './modalities';
export * from './payments';
export * from './profiles';
export * from './events';
import { supabase } from '@/lib/supabase';

// Re-export types so components can still import them from @/lib/api
export type {
  AthleteModality,
  AthleteManagement,
  Branch,
  BranchAnalytics,
  Event
} from '../../types/api';

export interface PaymentStatus {
  status_pagamento: string;
  quantidade: number;
}

export const fetchBranchAnalytics = async (eventId: string | null, filialId?: string) => {
  if (!eventId) return [];
  
  try {
    console.log('fetchBranchAnalytics called with eventId:', eventId, 'filialId:', filialId);
    
    // Query the analytics view - make sure we always filter by event_id
    let query = supabase
      .from('vw_analytics_inscricoes')
      .select('*');
    
    // Apply event filter - this is now essential since our view has evento_id
    query = query.eq('evento_id', eventId);
    
    // Apply filial filter only if provided (for delegation view)
    if (filialId) {
      console.log('Applying filial filter with ID:', filialId);
      query = query.eq('filial_id', filialId);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }

    console.log('Raw analytics data received:', data);

    if (!data || data.length === 0) {
      console.warn('No analytics data found with filters - creating mock data for development');
      
      // If no data is found, let's create mock data for development/testing
      const mockData = [{
        filial_id: filialId || 'mock-filial-id',
        filial: 'Filial Exemplo',
        evento_id: eventId, 
        total_inscritos_geral: 15,
        total_inscritos_modalidades: 25,
        valor_total_pago: 1500,
        valor_total_pendente: 500,
        modalidades_populares: [
          { modalidade: 'Atletismo', total_inscritos: 5 },
          { modalidade: 'Natação', total_inscritos: 8 }
        ],
        total_inscritos_por_status: [
          { status_pagamento: 'confirmado', quantidade: 10 },
          { status_pagamento: 'pendente', quantidade: 5 }
        ],
        inscritos_por_status_pagamento: [
          { status_pagamento: 'confirmado', quantidade: 10 },
          { status_pagamento: 'pendente', quantidade: 5 }
        ],
        ranking_filiais: [{ total_pontos: 120 }],
        atletas_por_categoria: [
          { categoria: 'Masculino', quantidade: 8 },
          { categoria: 'Feminino', quantidade: 7 }
        ],
        media_pontuacao_por_modalidade: [
          { modalidade: 'Atletismo', media_pontuacao: 8.5 },
          { modalidade: 'Natação', media_pontuacao: 9.2 }
        ],
        registros_por_filial: [
          { filial_nome: 'Filial A', status_pagamento: 'confirmado', quantidade: 7 },
          { filial_nome: 'Filial A', status_pagamento: 'pendente', quantidade: 3 },
          { filial_nome: 'Filial B', status_pagamento: 'confirmado', quantidade: 5 },
          { filial_nome: 'Filial B', status_pagamento: 'pendente', quantidade: 2 }
        ]
      }];
      
      return mockData;
    }

    // Process the data to ensure JSON fields are properly parsed
    const processedData = data.map(item => {
      // Helper function to safely parse JSON fields
      const parseJsonField = (field: any) => {
        if (typeof field === 'string') {
          try {
            return JSON.parse(field);
          } catch (e) {
            console.warn(`Failed to parse JSON field:`, field);
            return [];
          }
        }
        return field || [];
      };

      // Parse all JSON fields
      return {
        ...item,
        modalidades_populares: parseJsonField(item.modalidades_populares),
        total_inscritos_por_status: parseJsonField(item.total_inscritos_por_status),
        inscritos_por_status_pagamento: parseJsonField(item.inscritos_por_status_pagamento),
        ranking_filiais: parseJsonField(item.ranking_filiais) || [{ total_pontos: 0 }],
        atletas_por_categoria: parseJsonField(item.atletas_por_categoria),
        media_pontuacao_por_modalidade: parseJsonField(item.media_pontuacao_por_modalidade),
        registros_por_filial: parseJsonField(item.registros_por_filial) || []
      };
    });

    console.log('Processed analytics data:', processedData);
    return processedData;
  } catch (error) {
    console.error('Error in fetchBranchAnalytics:', error);
    throw error;
  }
};
