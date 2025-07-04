
import { supabase } from '../supabase';
import type { AthleteManagement } from '../../types/api';

export const fetchAthleteManagement = async (filterByBranch: boolean = false, eventId: string | null): Promise<AthleteManagement[]> => {
  console.log('Starting fetchAthleteManagement with filterByBranch:', filterByBranch, 'eventId:', eventId);
  
  try {
    if (!eventId) return [];

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      throw new Error('No authenticated user found');
    }

    console.log('Current user ID:', user.id);

    let userBranchId: string | null = null;
    if (filterByBranch) {
      const { data: userProfile } = await supabase
        .from('usuarios')
        .select('filial_id')
        .eq('id', user.id)
        .single();
      
      userBranchId = userProfile?.filial_id;
      console.log('User branch ID:', userBranchId);
    }

    // Get main athletes data from view
    let query = supabase
      .from('vw_athletes_management')
      .select('*')
      .eq('evento_id', eventId);

    if (filterByBranch && userBranchId) {
      query = query.eq('filial_id', userBranchId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching athletes:', error);
      throw error;
    }

    console.log('Raw athletes data:', data);
    console.log('Number of raw athletes:', data?.length);
    
    // Process the data
    const athletesMap = new Map<string, AthleteManagement>();
    
    // Process data from view
    if (data) {
      data.forEach(record => {
        if (!athletesMap.has(record.atleta_id)) {
          const paymentStatus = record.isento ? 'confirmado' : (record.status_pagamento || 'pendente');
          
          athletesMap.set(record.atleta_id, {
            id: record.atleta_id,
            nome_atleta: record.nome_atleta,
            email: record.email,
            telefone: record.telefone,
            tipo_documento: record.tipo_documento,
            numero_documento: record.numero_documento,
            genero: record.genero,
            numero_identificador: record.numero_identificador,
            status_confirmacao: record.status_confirmacao,
            filial_id: record.filial_id,
            filial_nome: record.filial_nome,
            status_pagamento: paymentStatus as 'pendente' | 'confirmado' | 'cancelado',
            usuario_registrador_id: record.usuario_registrador_id,
            registrador_nome: record.registrador_nome,
            registrador_email: record.registrador_email,
            modalidades: [],
            evento_id: eventId
          });
        }

        // Add modality if exists
        if (record.modalidade_nome) {
          const athlete = athletesMap.get(record.atleta_id)!;
          const modalityExists = athlete.modalidades.some(m => m.id === record.inscricao_id);
          
          if (!modalityExists && record.inscricao_id) {
            const modalityStatus = record.isento ? 'confirmado' : (record.status_inscricao || 'pendente');
            
            athlete.modalidades.push({
              id: record.inscricao_id.toString(),
              modalidade: record.modalidade_nome,
              status: modalityStatus,
              justificativa_status: record.justificativa_status || ''
            });
          }
        }
      });
    }

    // ALWAYS check if current user should be included
    console.log('Checking if current user should be included...');
    
    // Check if user is registered for this event
    const { data: userEventData, error: userEventError } = await supabase
      .from('inscricoes_eventos')
      .select('*')
      .eq('usuario_id', user.id)
      .eq('evento_id', eventId)
      .maybeSingle();
    
    if (userEventError) {
      console.error('Error checking user event registration:', userEventError);
    }
    
    console.log('User event registration data:', userEventData);
    
    if (userEventData) {
      console.log('Current user is registered for event');
      
      // Check if user is already in the athletes map
      const currentUserInData = athletesMap.has(user.id);
      console.log('Current user found in main data:', currentUserInData);
      
      if (!currentUserInData) {
        console.log('Adding current user manually...');
        
        // Get user's complete profile data
        const { data: userData, error: userDataError } = await supabase
          .from('usuarios')
          .select(`
            id,
            nome_completo,
            email,
            telefone,
            tipo_documento,
            numero_documento,
            genero,
            numero_identificador,
            filial_id
          `)
          .eq('id', user.id)
          .single();
        
        if (userDataError) {
          console.error('Error fetching user data:', userDataError);
        } else if (userData) {
          console.log('User profile data:', userData);
          
          // Get filial data
          let filialData = null;
          if (userData.filial_id) {
            const { data: filial } = await supabase
              .from('filiais')
              .select('nome')
              .eq('id', userData.filial_id)
              .single();
            filialData = filial;
          }
          
          // Get user's modalities for this event
          const { data: userModalities } = await supabase
            .from('inscricoes_modalidades')
            .select(`
              id,
              status,
              justificativa_status,
              modalidades (nome)
            `)
            .eq('atleta_id', user.id)
            .eq('evento_id', eventId);
          
          console.log('User modalities:', userModalities);
          
          // Get registrador info if exists
          let registradorInfo = null;
          if (userEventData.usuario_registrador_id && userEventData.usuario_registrador_id !== user.id) {
            const { data: registrador } = await supabase
              .from('usuarios')
              .select('nome_completo, email')
              .eq('id', userEventData.usuario_registrador_id)
              .single();
            
            registradorInfo = registrador;
          }
          
          const paymentStatus = userEventData.isento ? 'confirmado' : (userEventData.status_pagamento || 'pendente');
          
          // Check if user should be included based on branch filter
          const shouldIncludeUser = !filterByBranch || !userBranchId || userData.filial_id === userBranchId;
          console.log('Should include user based on branch filter:', shouldIncludeUser);
          
          if (shouldIncludeUser) {
            athletesMap.set(user.id, {
              id: userData.id,
              nome_atleta: userData.nome_completo,
              email: userData.email,
              telefone: userData.telefone,
              tipo_documento: userData.tipo_documento,
              numero_documento: userData.numero_documento,
              genero: userData.genero,
              numero_identificador: userData.numero_identificador,
              status_confirmacao: userEventData.status_confirmacao || 'pendente',
              filial_id: userData.filial_id,
              filial_nome: filialData?.nome || null,
              status_pagamento: paymentStatus as 'pendente' | 'confirmado' | 'cancelado',
              usuario_registrador_id: userEventData.usuario_registrador_id,
              registrador_nome: registradorInfo?.nome_completo || null,
              registrador_email: registradorInfo?.email || null,
              modalidades: userModalities?.map(mod => ({
                id: mod.id.toString(),
                modalidade: (mod.modalidades as any)?.nome || '',
                status: mod.status || 'pendente',
                justificativa_status: mod.justificativa_status || ''
              })) || [],
              evento_id: eventId
            });
            
            console.log('Successfully added current user to athletes map');
          }
        }
      }
    } else {
      console.log('Current user is not registered for this event');
    }

    const athletes = Array.from(athletesMap.values());
    console.log('Final athletes count:', athletes.length);
    console.log('Athletes list:', athletes.map(a => ({ id: a.id, name: a.nome_atleta })));
    console.log('Current user in final list:', athletes.find(a => a.id === user.id));
    
    return athletes;
  } catch (error) {
    console.error('Error in fetchAthleteManagement:', error);
    throw error;
  }
};
