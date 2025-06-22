
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ProfileType, Profile } from '../types';

export function useProfileTypes() {
  return useQuery({
    queryKey: ['profile-types'],
    queryFn: async () => {
      console.log('Fetching profile types...');
      const { data, error } = await supabase
        .from('perfis_tipo')
        .select('*')
        .order('descricao');

      if (error) {
        console.error('Error fetching profile types:', error);
        throw error;
      }
      console.log('Profile types fetched:', data);
      return data as ProfileType[];
    },
  });
}

export function useEventProfiles(eventId: string | null) {
  return useQuery({
    queryKey: ['event-profiles', eventId],
    queryFn: async () => {
      if (!eventId) {
        console.log('No eventId provided');
        return [];
      }

      console.log('Fetching profiles for event:', eventId);
      
      const { data, error } = await supabase
        .from('perfis')
        .select(`
          *,
          perfis_tipo (
            id,
            codigo,
            descricao
          ),
          taxas_inscricao!fk_taxas_inscricao_perfil (
            id,
            perfil_id,
            valor,
            isento,
            mostra_card,
            pix_key,
            data_limite_inscricao,
            contato_nome,
            contato_telefone,
            link_formulario
          )
        `)
        .eq('evento_id', eventId)
        .order('nome');

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }
      
      console.log('Profiles fetched:', data);
      console.log('Number of profiles found:', data?.length || 0);
      return data as Profile[];
    },
    enabled: !!eventId,
  });
}
