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

export interface ModalityWithRepresentatives {
  id: number;
  nome: string;
  categoria: string;
  representatives: {
    atleta_id: string;
    nome_completo: string;
    email: string;
    telefone: string;
  }[];
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
      .select('id, nome, categoria')
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

    // Combine the data - now supporting multiple representatives per modality
    const modalitiesWithReps: ModalityWithRepresentatives[] = modalities?.map(modality => {
      const modalityReps = representatives?.filter(r => r.modalidade_id === modality.id) || [];
      console.log(`Processing modality ${modality.id} (${modality.nome}), found ${modalityReps.length} representatives`);
      
      const representativesList = modalityReps.map(rep => {
        const userData = Array.isArray(rep.usuarios) ? rep.usuarios[0] : rep.usuarios;
        return {
          atleta_id: rep.atleta_id,
          nome_completo: userData?.nome_completo || '',
          email: userData?.email || '',
          telefone: userData?.telefone || ''
        };
      }).filter(rep => rep.nome_completo); // Filter out invalid representatives

      return {
        id: modality.id,
        nome: modality.nome,
        categoria: modality.categoria || '',
        representatives: representativesList
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
        usuarios!inscricoes_modalidades_atleta_id_fkey!inner(
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
  
  // Check RLS permissions before attempting operations
  console.log('Step 0: Checking RLS permissions...');
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error('Auth error - user not authenticated:', userError);
    throw new Error('Usuário não autenticado. Faça login novamente.');
  }
  
  if (!user) {
    console.error('No user found in auth context');
    throw new Error('Usuário não autenticado. Faça login novamente.');
  }
  
  console.log('Current user for RLS validation:', { userId: user.id, email: user.email });
  
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

    // Check if athlete is already a representative for this modality
    console.log('Step 4: Checking if athlete is already a representative...');
    const { data: existing, error: checkError } = await supabase
      .from('modalidade_representantes')
      .select('*')
      .eq('filial_id', filialId)
      .eq('modalidade_id', modalityId)
      .eq('atleta_id', atletaId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing representative:', checkError);
      throw new Error(`Erro ao verificar representante existente: ${checkError.message}`);
    }

    if (existing) {
      console.log('Athlete is already a representative for this modality');
      throw new Error('Este atleta já é representante desta modalidade');
    }

    console.log('Step 5: Creating new representative...');
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
      console.error('Full error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // Check for RLS policy violations
      if (error.code === '42501' || error.message?.includes('RLS') || error.message?.includes('policy')) {
        console.error('RLS Policy violation detected');
        throw new Error('Erro de permissão: Você não tem autorização para adicionar representantes neste evento. Verifique se você possui o perfil adequado e se está vinculado à filial correta.');
      }
      
      // Check for foreign key violations
      if (error.code === '23503') {
        console.error('Foreign key violation detected');
        throw new Error('Erro de dados: Verifique se o atleta, modalidade e filial existem no sistema.');
      }
      
      // Check for unique constraint violations
      if (error.code === '23505') {
        console.error('Unique constraint violation detected');
        throw new Error('Este atleta já é representante desta modalidade.');
      }
      
      throw new Error(`Erro ao criar representante: ${error.message}`);
    }
    
    console.log('Representative created successfully:', data);
    console.log('=== REPRESENTATIVE SET SUCCESSFULLY ===');
    return data;
  } catch (error) {
    console.error('=== ERROR IN setModalityRepresentative ===');
    console.error('Error details:', error);
    throw error;
  }
};

export const removeModalityRepresentative = async (filialId: string, modalityId: number, atletaId: string) => {
  console.log('=== REMOVING MODALITY REPRESENTATIVE ===');
  console.log('Parameters:', { filialId, modalityId, atletaId });
  
  // Check RLS permissions before attempting operations
  console.log('Step 0: Checking RLS permissions...');
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error('Auth error - user not authenticated:', userError);
    throw new Error('Usuário não autenticado. Faça login novamente.');
  }
  
  if (!user) {
    console.error('No user found in auth context');
    throw new Error('Usuário não autenticado. Faça login novamente.');
  }
  
  console.log('Current user for RLS validation:', { userId: user.id, email: user.email });
  
  try {
    const { data, error } = await supabase
      .from('modalidade_representantes')
      .delete()
      .eq('filial_id', filialId)
      .eq('modalidade_id', modalityId)
      .eq('atleta_id', atletaId)
      .select();

    if (error) {
      console.error('Error removing modality representative:', error);
      console.error('Full error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // Check for RLS policy violations
      if (error.code === '42501' || error.message?.includes('RLS') || error.message?.includes('policy')) {
        console.error('RLS Policy violation detected');
        throw new Error('Erro de permissão: Você não tem autorização para remover representantes neste evento. Verifique se você possui o perfil adequado e se está vinculado à filial correta.');
      }
      
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

export interface OrganizerModalityWithRepresentatives {
  id: number;
  nome: string;
  categoria: string;
  filial_nome: string;
  filial_id: string;
  representatives: {
    atleta_id: string;
    nome_completo: string;
    email: string;
    telefone: string;
  }[];
}

export const fetchAllModalitiesWithRepresentatives = async (eventId: string) => {
  console.log('fetchAllModalitiesWithRepresentatives called with eventId:', eventId);
  
  try {
    // Get all modalities for the event
    const { data: modalities, error: modalitiesError } = await supabase
      .from('modalidades')
      .select('id, nome, categoria')
      .eq('evento_id', eventId)
      .eq('status', 'Ativa');

    if (modalitiesError) {
      console.error('Error fetching modalities:', modalitiesError);
      throw modalitiesError;
    }

    // Get all filiais linked to this event
    const { data: eventFiliais, error: filiaisError } = await supabase
      .from('eventos_filiais')
      .select(`
        filial_id,
        filiais!eventos_filiais_filial_id_fkey(id, nome)
      `)
      .eq('evento_id', eventId);

    if (filiaisError) {
      console.error('Error fetching event filiais:', filiaisError);
      throw filiaisError;
    }

    // Get all representatives for all modalities in this event
    const { data: representatives, error: repsError } = await supabase
      .from('modalidade_representantes')
      .select(`
        modalidade_id,
        atleta_id,
        filial_id,
        usuarios!modalidade_representantes_atleta_id_fkey(nome_completo, email, telefone)
      `);

    if (repsError) {
      console.error('Error fetching representatives:', repsError);
      throw repsError;
    }

    // Create modality-filial combinations
    const modalitiesWithReps: OrganizerModalityWithRepresentatives[] = [];
    
    modalities?.forEach(modality => {
      eventFiliais?.forEach(eventFilial => {
        const filialData = Array.isArray(eventFilial.filiais) ? eventFilial.filiais[0] : eventFilial.filiais;
        
        // Get representatives for this specific modality-filial combination
        const modalityReps = representatives?.filter(r => 
          r.modalidade_id === modality.id && r.filial_id === eventFilial.filial_id
        ) || [];
        
        const representativesList = modalityReps.map(rep => {
          const userData = Array.isArray(rep.usuarios) ? rep.usuarios[0] : rep.usuarios;
          return {
            atleta_id: rep.atleta_id,
            nome_completo: userData?.nome_completo || '',
            email: userData?.email || '',
            telefone: userData?.telefone || ''
          };
        }).filter(rep => rep.nome_completo);

        modalitiesWithReps.push({
          id: modality.id,
          nome: modality.nome,
          categoria: modality.categoria || '',
          filial_nome: filialData?.nome || 'Nome não encontrado',
          filial_id: eventFilial.filial_id,
          representatives: representativesList
        });
      });
    });

    console.log('Combined modalities with representatives for organizer:', modalitiesWithReps);
    return modalitiesWithReps;
  } catch (error) {
    console.error('Exception in fetchAllModalitiesWithRepresentatives:', error);
    throw error;
  }
};
