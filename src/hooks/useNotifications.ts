
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/types/notifications';

interface UseNotificationsProps {
  eventId: string | null;
  userId?: string;
}

export function useNotifications({ eventId, userId }: UseNotificationsProps) {
  return useQuery({
    queryKey: ['notifications', eventId, userId],
    queryFn: async () => {
      if (!eventId || !userId) {
        console.log('No eventId or userId provided for notifications');
        return [];
      }

      console.log('Fetching notifications for:', { eventId, userId });

      try {
        // Buscar filial do usuário
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('filial_id')
          .eq('id', userId)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          throw userError;
        }

        // Consulta principal para notificações segmentadas
        const { data, error } = await supabase
          .from('notificacoes')
          .select(`
            id,
            evento_id,
            autor_id,
            autor_nome,
            tipo_autor,
            titulo,
            mensagem,
            visivel,
            criado_em,
            atualizado_em,
            notificacao_destinatarios!inner(filial_id),
            notificacao_leituras(lido_em)
          `)
          .eq('evento_id', eventId)
          .eq('visivel', true)
          .or(`filial_id.is.null,filial_id.eq.${userData.filial_id}`, { 
            foreignTable: 'notificacao_destinatarios' 
          })
          .eq('notificacao_leituras.usuario_id', userId)
          .order('criado_em', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
          throw error;
        }

        console.log('Notifications from database:', data);

        if (!data) return [];

        // Transformar dados para incluir campo 'lida'
        const notifications: Notification[] = data.map((item: any) => ({
          id: item.id,
          evento_id: item.evento_id,
          autor_id: item.autor_id,
          autor_nome: item.autor_nome || 'Usuário desconhecido',
          tipo_autor: item.tipo_autor,
          titulo: item.titulo,
          mensagem: item.mensagem,
          visivel: item.visivel,
          criado_em: item.criado_em,
          atualizado_em: item.atualizado_em,
          lida: item.notificacao_leituras && item.notificacao_leituras.length > 0
        }));

        console.log('Final processed notifications:', notifications);
        return notifications;

      } catch (error) {
        console.error('Error in useNotifications:', error);
        throw error;
      }
    },
    enabled: !!eventId && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });
}
