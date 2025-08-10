
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface ReadOnlyResult {
  isReadOnly: boolean;
  status: string | null;
  hasPrivilegedRole: boolean;
}

export function useReadOnlyEvent(userId?: string, eventId?: string | null) {
  return useQuery<ReadOnlyResult>({
    queryKey: ['read-only-event', userId, eventId],
    enabled: !!userId && !!eventId,
    queryFn: async () => {
      if (!userId || !eventId) {
        return { isReadOnly: false, status: null, hasPrivilegedRole: false };
      }

      const [eventRes, rolesRes] = await Promise.all([
        supabase
          .from('eventos')
          .select('status_evento')
          .eq('id', eventId)
          .single(),
        supabase
          .from('papeis_usuarios')
          .select('perfis!inner(nome)')
          .eq('usuario_id', userId)
          .eq('evento_id', eventId)
      ]);

      if (eventRes.error) throw eventRes.error;
      if (rolesRes.error) throw rolesRes.error;

      const status = (eventRes.data as any)?.status_evento as string;
      const isLockedStatus = status === 'encerrado' || status === 'suspenso';

      const hasPrivilegedRole = (rolesRes.data || []).some((r: any) => {
        const nome = r.perfis?.nome;
        return nome === 'Administração' || nome === 'Organizador' || nome === 'Administrador';
      });

      return {
        isReadOnly: isLockedStatus && !hasPrivilegedRole,
        status: status || null,
        hasPrivilegedRole,
      };
    }
  });
}
