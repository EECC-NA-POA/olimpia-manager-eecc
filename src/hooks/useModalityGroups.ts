import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface WhatsAppGroup {
  id: number;
  evento_id: string;
  filial_id: string;
  nome: string;
  link_grupo: string;
  modalidade_ids: number[];
}

/** Busca os grupos de uma filial num evento, com suas modalidades */
export function useWhatsAppGroupsByFilial(eventId: string | null, filialId: string | null | undefined) {
  return useQuery({
    queryKey: ['whatsapp-groups', eventId, filialId],
    queryFn: async (): Promise<WhatsAppGroup[]> => {
      if (!eventId || !filialId) return [];
      const { data, error } = await supabase
        .from('grupos_whatsapp')
        .select(`
          id, evento_id, filial_id, nome, link_grupo,
          grupos_whatsapp_modalidades(modalidade_id)
        `)
        .eq('evento_id', eventId)
        .eq('filial_id', filialId)
        .order('nome');
      if (error) throw error;
      return (data || []).map((g: any) => ({
        id: g.id,
        evento_id: g.evento_id,
        filial_id: g.filial_id,
        nome: g.nome,
        link_grupo: g.link_grupo,
        modalidade_ids: (g.grupos_whatsapp_modalidades || []).map((m: any) => m.modalidade_id),
      }));
    },
    enabled: !!eventId && !!filialId,
  });
}

/** Resolve o link do grupo para uma modalidade específica (do ponto de vista do atleta) */
export function findGroupLinkForModality(groups: WhatsAppGroup[], modalidadeId: number): { nome: string; link: string } | null {
  const group = groups.find(g => g.modalidade_ids.includes(modalidadeId));
  return group ? { nome: group.nome, link: group.link_grupo } : null;
}

/** Cria ou atualiza um grupo com suas modalidades */
export function useUpsertWhatsAppGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      eventoId,
      filialId,
      nome,
      linkGrupo,
      modalidadeIds,
    }: {
      id?: number;
      eventoId: string;
      filialId: string;
      nome: string;
      linkGrupo: string;
      modalidadeIds: number[];
    }) => {
      let groupId = id;

      if (groupId) {
        // Atualiza o grupo existente
        const { error } = await supabase
          .from('grupos_whatsapp')
          .update({ nome, link_grupo: linkGrupo })
          .eq('id', groupId);
        if (error) throw error;
      } else {
        // Cria novo grupo
        const { data, error } = await supabase
          .from('grupos_whatsapp')
          .insert({ evento_id: eventoId, filial_id: filialId, nome, link_grupo: linkGrupo })
          .select('id')
          .single();
        if (error) throw error;
        groupId = data.id;
      }

      // Reseta as modalidades do grupo
      await supabase.from('grupos_whatsapp_modalidades').delete().eq('grupo_id', groupId);
      if (modalidadeIds.length > 0) {
        const rows = modalidadeIds.map(mid => ({ grupo_id: groupId, modalidade_id: mid }));
        const { error: linkError } = await supabase.from('grupos_whatsapp_modalidades').insert(rows);
        if (linkError) throw linkError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-groups'] });
      toast.success('Grupo salvo!');
    },
    onError: () => toast.error('Erro ao salvar grupo.'),
  });
}

/** Remove um grupo (cascade remove as modalidades) */
export function useDeleteWhatsAppGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('grupos_whatsapp').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-groups'] });
      toast.success('Grupo removido.');
    },
    onError: () => toast.error('Erro ao remover grupo.'),
  });
}
