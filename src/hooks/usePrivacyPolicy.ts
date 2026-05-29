import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface PrivacyPolicy {
    id: string;
    versao_termo: string;
    texto: string;
    data_criacao: string;
    ativo: boolean;
}

export function usePrivacyPolicy() {
    const { user } = useAuth();

    // Fetch latest active privacy policy
    const { data: latestPolicy, isLoading } = useQuery({
        queryKey: ['privacy-policy', 'latest'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('vw_latest_termo_privacidade')
                .select('*')
                .single();

            if (error) {
                console.error('Error fetching privacy policy:', error);
                return null;
            }

            return data as PrivacyPolicy;
        },
    });

    // Record acceptance
    const acceptPolicy = useMutation({
        mutationFn: async ({ policyId, version, text }: { policyId: string, version: string, text: string }) => {
            if (!user?.id) throw new Error('User not authenticated');

            const { error } = await supabase
                .from('logs_aceite_privacidade')
                .insert({
                    usuario_id: user.id,
                    termo_privacidade_id: policyId,
                    versao_termo: version,
                    termo_texto: text,
                });

            if (error) throw error;
        },
    });

    return {
        latestPolicy,
        isLoading,
        acceptPolicy,
    };
}
