
import { supabase } from '@/lib/supabase';

export interface ModalityRepresentative {
  id: string;
  filial_id: string;
  modalidade_id: number;
  atleta_id: string;
  criado_em: string;
  atualizado_em: string | null;
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

    // Then get representatives for this filial
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
      console.log(`Processing modality ${modality.id} (${modality.nome}), found rep:`, rep);
      
      let representative = undefined;
      if (rep?.usuarios) {
        // Handle both array and object formats
        const userData = Array.isArray(rep.usuarios) ? rep.usuarios[0] : rep.usuarios;
        console.log('User data for representative:', userData);
        
        if (userData && userData.nome_completo) {
          representative = {
            atleta_id: rep.atleta_id,
            nome_completo: userData.nome_completo,
            email: userData.email,
            telefone: userData.telefone
          };
          console.log('Created representative object:', representative);
        }
      }

      const result = {
        id: modality.id,
        nome: modality.nome,
        representative
      };
      
      console.log(`Final modality with representative:`, result);
      return result;
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
  console.log('=== SETTING MODALITY REPRESENTATIVE ===');
  console.log('Parameters:', { filialId, modalityId, atletaId });
  
  try {
    // Verify the athlete exists and belongs to the filial
    console.log('Step 1: Verifying athlete exists...');
    const { data: athlete, error: athleteError } = await supabase
      .from('usuarios')
      .select('id, nome_completo, filial_id')
      .eq('id', atletaId)
      .single();

    if (athleteError) {
      console.error('Error verifying athlete:', athleteError);
      throw new Error(`Atleta não encontrado: ${athleteError.message}`);
    }

    if (!athlete) {
      console.error('Athlete not found');
      throw new Error('Atleta não encontrado');
    }

    if (athlete.filial_id !== filialId) {
      console.error('Athlete does not belong to the filial:', { athleteFilial: athlete.filial_id, expectedFilial: filialId });
      throw new Error('Atleta não pertence à filial especificada');
    }

    console.log('Athlete verified:', athlete);

    // Verify the modality exists
    console.log('Step 2: Verifying modality exists...');
    const { data: modality, error: modalityError } = await supabase
      .from('modalidades')
      .select('id, nome')
      .eq('id', modalityId)
      .single();

    if (modalityError) {
      console.error('Error verifying modality:', modalityError);
      throw new Error(`Modalidade não encontrada: ${modalityError.message}`);
    }

    console.log('Modality verified:', modality);

    // Check if athlete is registered for this modality
    console.log('Step 3: Checking athlete registration...');
    const { data: registration, error: registrationError } = await supabase
      .from('inscricoes_modalidades')
      .select('*')
      .eq('atleta_id', atletaId)
      .eq('modalidade_id', modalityId)
      .eq('status', 'confirmado')
      .single();

    if (registrationError && registrationError.code !== 'PGRST116') {
      console.error('Error checking registration:', registrationError);
      throw new Error(`Erro ao verificar inscrição: ${registrationError.message}`);
    }

    if (!registration) {
      console.error('Athlete not registered for modality');
      throw new Error('Atleta não está inscrito nesta modalidade ou inscrição não confirmada');
    }

    console.log('Registration verified:', registration);

    // Check if a representative already exists for this modality and filial
    console.log('Step 4: Checking existing representative...');
    const { data: existing, error: checkError } = await supabase
      .from('modalidade_representantes')
      .select('*')
      .eq('filial_id', filialId)
      .eq('modalidade_id', modalityId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing representative:', checkError);
      throw new Error(`Erro ao verificar representante existente: ${checkError.message}`);
    }

    console.log('Existing representative check result:', existing);

    let result;
    if (existing) {
      // Update existing representative
      console.log('Step 5a: Updating existing representative...');
      const { data, error } = await supabase
        .from('modalidade_representantes')
        .update({
          atleta_id: atletaId,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select(`
          *,
          usuarios!modalidade_representantes_atleta_id_fkey(nome_completo, email, telefone)
        `)
        .single();

      if (error) {
        console.error('Error updating modality representative:', error);
        throw new Error(`Erro ao atualizar representante: ${error.message}`);
      }
      
      result = data;
      console.log('Representative updated successfully:', result);
    } else {
      // Insert new representative
      console.log('Step 5b: Creating new representative...');
      const { data, error } = await supabase
        .from('modalidade_representantes')
        .insert({
          filial_id: filialId,
          modalidade_id: modalityId,
          atleta_id: atletaId
        })
        .select(`
          *,
          usuarios!modalidade_representantes_atleta_id_fkey(nome_completo, email, telefone)
        `)
        .single();

      if (error) {
        console.error('Error inserting modality representative:', error);
        throw new Error(`Erro ao criar representante: ${error.message}`);
      }
      
      result = data;
      console.log('Representative created successfully:', result);
    }
    
    console.log('=== REPRESENTATIVE SET SUCCESSFULLY ===');
    return result;
  } catch (error) {
    console.error('=== ERROR IN setModalityRepresentative ===');
    console.error('Error details:', error);
    throw error;
  }
};

export const removeModalityRepresentative = async (filialId: string, modalityId: number) => {
  console.log('=== REMOVING MODALITY REPRESENTATIVE ===');
  console.log('Parameters:', { filialId, modalityId });
  
  try {
    const { data, error } = await supabase
      .from('modalidade_representantes')
      .delete()
      .eq('filial_id', filialId)
      .eq('modalidade_id', modalityId)
      .select();

    if (error) {
      console.error('Error removing modality representative:', error);
      throw new Error(`Erro ao remover representante: ${error.message}`);
    }
    
    console.log('Representative removed successfully:', data);
    console.log('=== REPRESENTATIVE REMOVED SUCCESSFULLY ===');
    return data;
  } catch (error) {
    console.error('=== ERROR IN removeModalityRepresentative ===');
    console.error('Error details:', error);
    throw error;
  }
};
