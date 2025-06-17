
import { supabase } from '@/lib/supabase';

export interface ModalityRepresentative {
  id: string;
  filial_id: string;
  modalidade_id: number;
  atleta_id: string;
  created_at: string;
  updated_at: string;
  modalidades?: {
    id: number;
    nome: string;
  };
  usuarios?: {
    id: string;
    nome_completo: string;
    email: string;
    telefone: string;
  };
}

export interface ModalityWithRepresentative {
  id: number;
  nome: string;
  representative?: {
    atleta_id: string;
    nome_completo: string;
    email: string;
    telefone: string;
  };
}

export const fetchModalityRepresentatives = async (filialId: string, eventId: string) => {
  console.log('fetchModalityRepresentatives called with:', { filialId, eventId });
  
  try {
    const { data, error } = await supabase
      .from('modalidade_representantes')
      .select(`
        *,
        modalidades!inner(id, nome),
        usuarios!modalidade_representantes_atleta_id_fkey(id, nome_completo, email, telefone)
      `)
      .eq('filial_id', filialId)
      .eq('modalidades.evento_id', eventId);

    if (error) {
      console.error('Error fetching modality representatives:', error);
      throw error;
    }
    
    console.log('Modality representatives data:', data);
    return data as ModalityRepresentative[];
  } catch (error) {
    console.error('Exception in fetchModalityRepresentatives:', error);
    throw error;
  }
};

export const fetchModalitiesWithRepresentatives = async (filialId: string, eventId: string) => {
  console.log('fetchModalitiesWithRepresentatives called with:', { filialId, eventId });
  
  try {
    // First get all modalities for the event
    const { data: modalities, error: modalitiesError } = await supabase
      .from('modalidades')
      .select('id, nome')
      .eq('evento_id', eventId)
      .eq('status', 'Ativa');

    if (modalitiesError) {
      console.error('Error fetching modalities:', modalitiesError);
      throw modalitiesError;
    }

    console.log('Modalities fetched:', modalities);

    // Then get representatives for this filial - fix the relationship specification
    const { data: representatives, error: repsError } = await supabase
      .from('modalidade_representantes')
      .select(`
        modalidade_id,
        atleta_id,
        usuarios!modalidade_representantes_atleta_id_fkey(nome_completo, email, telefone)
      `)
      .eq('filial_id', filialId);

    if (repsError) {
      console.error('Error fetching representatives:', repsError);
      throw repsError;
    }

    console.log('Representatives fetched:', representatives);

    // Combine the data
    const modalitiesWithReps: ModalityWithRepresentative[] = modalities?.map(modality => {
      const rep = representatives?.find(r => r.modalidade_id === modality.id);
      console.log('Processing modality:', modality.id, 'found rep:', rep);
      
      let representative = undefined;
      if (rep && rep.usuarios) {
        // Handle case where usuarios might be an array (shouldn't happen with the foreign key, but let's be safe)
        const userData = Array.isArray(rep.usuarios) ? rep.usuarios[0] : rep.usuarios;
        console.log('User data for representative:', userData);
        
        if (userData) {
          representative = {
            atleta_id: rep.atleta_id,
            nome_completo: userData.nome_completo,
            email: userData.email,
            telefone: userData.telefone
          };
        }
      }

      return {
        id: modality.id,
        nome: modality.nome,
        representative
      };
    }) || [];

    console.log('Combined modalities with representatives:', modalitiesWithReps);
    return modalitiesWithReps;
  } catch (error) {
    console.error('Exception in fetchModalitiesWithRepresentatives:', error);
    throw error;
  }
};

export const fetchRegisteredAthletesForModality = async (filialId: string, modalityId: number, eventId: string) => {
  console.log('fetchRegisteredAthletesForModality called with:', { filialId, modalityId, eventId });
  
  try {
    const { data, error } = await supabase
      .from('inscricoes_modalidades')
      .select(`
        atleta_id,
        usuarios!inner(
          id,
          nome_completo,
          email,
          telefone,
          filial_id
        )
      `)
      .eq('modalidade_id', modalityId)
      .eq('evento_id', eventId)
      .eq('status', 'confirmado')
      .eq('usuarios.filial_id', filialId);

    if (error) {
      console.error('Error fetching registered athletes:', error);
      throw error;
    }

    console.log('Registered athletes data:', data);

    const athletes = data?.map(item => {
      // Handle case where usuarios might be an array
      const userData = Array.isArray(item.usuarios) ? item.usuarios[0] : item.usuarios;
      return {
        id: item.atleta_id,
        nome_completo: userData.nome_completo,
        email: userData.email,
        telefone: userData.telefone
      };
    }) || [];

    console.log('Processed athletes:', athletes);
    return athletes;
  } catch (error) {
    console.error('Exception in fetchRegisteredAthletesForModality:', error);
    throw error;
  }
};

export const setModalityRepresentative = async (filialId: string, modalityId: number, atletaId: string) => {
  console.log('setModalityRepresentative called with:', { filialId, modalityId, atletaId });
  
  try {
    // First, let's check if a representative already exists for this modality and filial
    const { data: existing, error: checkError } = await supabase
      .from('modalidade_representantes')
      .select('*')
      .eq('filial_id', filialId)
      .eq('modalidade_id', modalityId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error checking existing representative:', checkError);
      throw checkError;
    }

    console.log('Existing representative:', existing);

    let result;
    if (existing) {
      // Update existing representative
      const { data, error } = await supabase
        .from('modalidade_representantes')
        .update({
          atleta_id: atletaId,
          updated_at: new Date().toISOString()
        })
        .eq('filial_id', filialId)
        .eq('modalidade_id', modalityId)
        .select();

      if (error) {
        console.error('Error updating modality representative:', error);
        throw error;
      }
      result = data;
    } else {
      // Insert new representative
      const { data, error } = await supabase
        .from('modalidade_representantes')
        .insert({
          filial_id: filialId,
          modalidade_id: modalityId,
          atleta_id: atletaId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('Error inserting modality representative:', error);
        throw error;
      }
      result = data;
    }
    
    console.log('Representative set successfully:', result);
    return result;
  } catch (error) {
    console.error('Exception in setModalityRepresentative:', error);
    throw error;
  }
};

export const removeModalityRepresentative = async (filialId: string, modalityId: number) => {
  console.log('removeModalityRepresentative called with:', { filialId, modalityId });
  
  try {
    const { error } = await supabase
      .from('modalidade_representantes')
      .delete()
      .eq('filial_id', filialId)
      .eq('modalidade_id', modalityId);

    if (error) {
      console.error('Error removing modality representative:', error);
      throw error;
    }
    
    console.log('Representative removed successfully');
  } catch (error) {
    console.error('Exception in removeModalityRepresentative:', error);
    throw error;
  }
};
