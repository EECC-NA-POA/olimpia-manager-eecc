import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface PendingEnrollment {
  id: number;
  atleta_id: string;
  nome_atleta: string;
  modalidade_id: number;
  modalidade_nome: string;
  filial: string;
  filial_id: string;
  data_inscricao: string;
  evento_id: string;
  status_pagamento: 'pendente' | 'confirmado' | 'cancelado';
}

export function usePendingEnrollments(eventId: string | null, filialIds?: string[]) {
  return useQuery({
    queryKey: ['pending-enrollments', eventId, filialIds?.join(',') || 'all'],
    queryFn: async (): Promise<PendingEnrollment[]> => {
      if (!eventId) return [];

      // 1. Fetch pending modality enrollments with basic athlete info
      const { data, error } = await supabase
        .from('inscricoes_modalidades')
        .select(`
          id,
          atleta_id,
          modalidade_id,
          data_inscricao,
          evento_id,
          modalidades(nome),
          usuarios!atleta_id(nome_completo, filial_id, filiais(nome))
        `)
        .eq('evento_id', eventId)
        .eq('status', 'pendente')
        .order('data_inscricao', { ascending: false });

      if (error) throw error;

      let items = (data || []).filter((item: any) => item.usuarios !== null);

      if (filialIds && filialIds.length > 0) {
        items = items.filter((item: any) => {
          const user = item.usuarios as any;
          return user?.filial_id && filialIds.includes(user.filial_id);
        });
      }

      if (items.length === 0) return [];

      // 2. Fetch payment status for these athletes from inscricoes_eventos
      // (mirrors the pattern used in src/lib/api/athletes.ts)
      const athleteIds = [...new Set(items.map((i: any) => i.atleta_id as string))];
      const { data: eventRegs } = await supabase
        .from('inscricoes_eventos')
        .select('usuario_id, status_pagamento, isento')
        .eq('evento_id', eventId)
        .in('usuario_id', athleteIds);

      const paymentMap = new Map<string, 'pendente' | 'confirmado' | 'cancelado'>();
      for (const reg of eventRegs || []) {
        const status: 'pendente' | 'confirmado' | 'cancelado' =
          (reg as any).isento ? 'confirmado' : ((reg as any).status_pagamento || 'pendente');
        paymentMap.set((reg as any).usuario_id, status);
      }

      return items.map((item: any) => {
        const user = item.usuarios as any;
        return {
          id: item.id,
          atleta_id: item.atleta_id,
          nome_atleta: user?.nome_completo || 'Desconhecido',
          modalidade_id: item.modalidade_id,
          modalidade_nome: item.modalidades?.nome || 'Desconhecida',
          filial: user?.filiais?.nome || 'Desconhecida',
          filial_id: user?.filial_id || '',
          data_inscricao: item.data_inscricao || '',
          evento_id: item.evento_id,
          status_pagamento: paymentMap.get(item.atleta_id) || 'pendente',
        };
      });
    },
    enabled: !!eventId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
}
