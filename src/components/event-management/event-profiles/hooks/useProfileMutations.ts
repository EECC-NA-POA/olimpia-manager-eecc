
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Profile } from '../types';

export type ProfileFormValues = {
  nome: string;
  descricao?: string;
  perfil_tipo_id: string;
  valor: number;
  isento: boolean;
  mostra_card: boolean;
  pix_key?: string;
  data_limite_inscricao?: string;
  contato_nome?: string;
  contato_telefone?: string;
  link_formulario?: string;
};

export function useCreateUpdateProfile(eventId: string | null, editingProfile: Profile | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      if (!eventId) throw new Error('Event ID is required');

      if (editingProfile) {
        // Update profile
        const { error: profileError } = await supabase
          .from('perfis')
          .update({
            nome: data.nome,
            descricao: data.descricao || null,
            perfil_tipo_id: data.perfil_tipo_id,
          })
          .eq('id', editingProfile.id);

        if (profileError) throw profileError;

        // Update registration fee
        const existingFee = editingProfile.taxas_inscricao?.[0];
        if (existingFee) {
          const { error: feeError } = await supabase
            .from('taxas_inscricao')
            .update({
              valor: data.valor,
              isento: data.isento,
              mostra_card: data.mostra_card,
              pix_key: data.pix_key || null,
              data_limite_inscricao: data.data_limite_inscricao || null,
              contato_nome: data.contato_nome || null,
              contato_telefone: data.contato_telefone || null,
              link_formulario: data.link_formulario || null,
            })
            .eq('id', existingFee.id);

          if (feeError) throw feeError;
        }
      } else {
        // Create profile
        const { data: newProfile, error: profileError } = await supabase
          .from('perfis')
          .insert({
            nome: data.nome,
            descricao: data.descricao || null,
            evento_id: eventId,
            perfil_tipo_id: data.perfil_tipo_id,
          })
          .select()
          .single();

        if (profileError) throw profileError;

        // Create registration fee
        const { error: feeError } = await supabase
          .from('taxas_inscricao')
          .insert({
            perfil_id: newProfile.id,
            evento_id: eventId,
            valor: data.valor,
            isento: data.isento,
            mostra_card: data.mostra_card,
            pix_key: data.pix_key || null,
            data_limite_inscricao: data.data_limite_inscricao || null,
            contato_nome: data.contato_nome || null,
            contato_telefone: data.contato_telefone || null,
            link_formulario: data.link_formulario || null,
          });

        if (feeError) throw feeError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-profiles', eventId] });
      toast.success(editingProfile ? 'Perfil atualizado com sucesso!' : 'Perfil criado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error saving profile:', error);
      toast.error('Erro ao salvar perfil: ' + error.message);
    },
  });
}

export function useDeleteProfile(eventId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileId: number) => {
      const { error } = await supabase
        .from('perfis')
        .delete()
        .eq('id', profileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-profiles', eventId] });
      toast.success('Perfil excluído com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error deleting profile:', error);
      toast.error('Erro ao excluir perfil: ' + error.message);
    },
  });
}
