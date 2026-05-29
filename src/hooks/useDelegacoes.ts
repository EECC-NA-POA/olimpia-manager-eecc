import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Hook to fetch the filial IDs that a delegation representative can manage.
 * 
 * Uses the `get_user_delegacao_filiais` RPC which:
 * - If the user has a delegation → returns all filial_ids from that delegation
 * - Otherwise → falls back to [user.filial_id]
 */
export function useDelegacaoFiliais(userId: string | undefined, eventId: string | undefined) {
    return useQuery({
        queryKey: ['delegacao-filiais', userId, eventId],
        queryFn: async () => {
            if (!userId || !eventId) return [];

            const { data, error } = await supabase.rpc('get_user_delegacao_filiais', {
                p_user_id: userId,
                p_evento_id: eventId,
            });

            if (error) {
                console.error('Error fetching delegacao filiais:', error);
                // Fallback: try to get user's own filial_id
                const { data: userData } = await supabase
                    .from('usuarios')
                    .select('filial_id')
                    .eq('id', userId)
                    .single();

                return userData?.filial_id ? [userData.filial_id] : [];
            }

            return (data as string[]) || [];
        },
        enabled: !!userId && !!eventId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook to fetch all delegations for an event (used by Organizers in admin UI).
 */
export function useDelegacoes(eventId: string | undefined) {
    return useQuery({
        queryKey: ['delegacoes', eventId],
        queryFn: async () => {
            if (!eventId) return [];

            const { data, error } = await supabase
                .from('delegacoes')
                .select(`
                    id,
                    nome,
                    descricao,
                    criado_em,
                    delegacao_filiais(
                        filial_id,
                        filiais(id, nome, cidade, estado)
                    ),
                    delegacao_representantes(
                        usuario_id,
                        usuarios(id, nome_completo, email)
                    )
                `)
                .eq('evento_id', eventId)
                .order('nome');

            if (error) {
                console.error('Error fetching delegacoes:', error);
                throw error;
            }

            return data || [];
        },
        enabled: !!eventId,
    });
}

/**
 * Service functions for managing delegations (CRUD).
 */
export async function createDelegacao(eventId: string, nome: string, descricao?: string) {
    const { data, error } = await supabase
        .from('delegacoes')
        .insert({ evento_id: eventId, nome, descricao: descricao || null })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateDelegacao(id: string, nome: string, descricao?: string) {
    const { error } = await supabase
        .from('delegacoes')
        .update({ nome, descricao: descricao || null })
        .eq('id', id);

    if (error) throw error;
}

export async function deleteDelegacao(id: string) {
    const { error } = await supabase
        .from('delegacoes')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function setDelegacaoFiliais(delegacaoId: string, filialIds: string[]) {
    // Remove all existing filiais for this delegation
    await supabase
        .from('delegacao_filiais')
        .delete()
        .eq('delegacao_id', delegacaoId);

    // Insert the new set
    if (filialIds.length > 0) {
        const rows = filialIds.map(fid => ({
            delegacao_id: delegacaoId,
            filial_id: fid,
        }));

        const { error } = await supabase
            .from('delegacao_filiais')
            .insert(rows);

        if (error) throw error;
    }
}

export async function addDelegacaoRepresentante(delegacaoId: string, usuarioId: string) {
    const { error } = await supabase
        .from('delegacao_representantes')
        .insert({ delegacao_id: delegacaoId, usuario_id: usuarioId });

    if (error) {
        if (error.code === '23505' || error.message?.includes('já pertence')) {
            throw new Error('Este representante já pertence a uma delegação neste evento.');
        }
        throw error;
    }
}

export async function removeDelegacaoRepresentante(delegacaoId: string, usuarioId: string) {
    const { error } = await supabase
        .from('delegacao_representantes')
        .delete()
        .eq('delegacao_id', delegacaoId)
        .eq('usuario_id', usuarioId);

    if (error) throw error;
}
