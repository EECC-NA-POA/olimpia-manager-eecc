import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useHideNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ notificationId, userId }: { notificationId: string; userId: string }) => {
            console.log('Hiding notification', notificationId, 'for user', userId);
            const { error } = await supabase
                .from('notificacoes_excluidas')
                .insert({
                    notificacao_id: notificationId,
                    usuario_id: userId
                });

            if (error) {
                // Ignora erro de duplicação caso já exista
                if (error.code !== '23505') {
                    throw error;
                }
            }
            return true;
        },
        onSuccess: () => {
            // Invalida a busca de notificações para remover da listagem imediatamente
            queryClient.invalidateQueries({
                queryKey: ['notifications'],
                exact: false
            });

            queryClient.refetchQueries({
                queryKey: ['notifications'],
                exact: false
            });
        },
        onError: (error) => {
            console.error('Error hiding notification:', error);
            toast.error('Erro ao excluir notificação');
        }
    });
}
