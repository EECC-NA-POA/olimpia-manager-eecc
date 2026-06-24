import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AuditLogEntry {
  id: number;
  entidade: 'chamada' | 'presenca';
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  chamada_id: string;
  atleta_id: string | null;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  user_id: string | null;
  timestamp: string;
  usuario_nome: string;
}

export function useChamadaAuditLog(chamadaId: string | null) {
  return useQuery({
    queryKey: ['chamada-audit-log', chamadaId],
    queryFn: async (): Promise<AuditLogEntry[]> => {
      if (!chamadaId) return [];

      const { data: entries, error } = await supabase
        .from('chamadas_audit_log')
        .select('*')
        .eq('chamada_id', chamadaId)
        .order('timestamp', { ascending: false });

      // Tabela pode não existir ainda (antes da migração)
      if (error) {
        if (error.code === '42P01') return []; // relation does not exist
        throw error;
      }
      if (!entries?.length) return [];

      const userIds = [...new Set(entries.map(e => e.user_id).filter(Boolean))] as string[];
      const { data: users } = await supabase
        .from('usuarios')
        .select('id, nome_completo')
        .in('id', userIds);
      const nameMap = new Map((users ?? []).map(u => [u.id, u.nome_completo]));

      return entries.map(e => ({
        ...e,
        usuario_nome: nameMap.get(e.user_id) ?? 'Desconhecido',
      })) as AuditLogEntry[];
    },
    enabled: !!chamadaId,
    staleTime: 30 * 1000,
  });
}
