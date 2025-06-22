
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
    console.log('Looking for current user ID in results:', user.id);
    
    // Log if current user appears in the raw data
    const currentUserInData = data?.find(record => record.atleta_id === user.id);
    console.log('Current user found in raw data:', currentUserInData);

    // If current user is not in the main data, try to fetch their data separately
    let currentUserData = null;
    if (!currentUserInData) {
      console.log('Current user not found in main view, fetching separately...');
      
      // Check if user is registered in the event
      const { data: userEventRegistration } = await supabase
        .from('inscricoes_eventos')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('evento_id', eventId);
      
      console.log('User event registration:', userEventRegistration);
      
      if (userEventRegistration && userEventRegistration.length > 0) {
        // Fetch user's complete data
        const { data: userData } = await supabase
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
            filial_id,
            filiais!inner(nome)
          `)
          .eq('id', user.id)
          .single();
        
        if (userData) {
          // Get user's modalities for this event
          const { data: userModalities } = await supabase
            .from('inscricoes_modalidades')
            .select(`
              id,
              status,
              justificativa_status,
              modalidades!inner(nome)
            `)
            .eq('atleta_id', user.id)
            .eq('evento_id', eventId);
          
          // Get user's payment info
          const { data: paymentInfo } = await supabase
            .from('inscricoes_eventos')
            .select('status_pagamento, isento, usuario_registrador_id')
            .eq('usuario_id', user.id)
            .eq('evento_id', eventId)
            .single();
          
          // Get registrador info if exists
          let registradorInfo = null;
          if (paymentInfo?.usuario_registrador_id && paymentInfo.usuario_registrador_id !== user.id) {
            const { data: registrador } = await supabase
              .from('usuarios')
              .select('nome_completo, email')
              .eq('id', paymentInfo.usuario_registrador_id)
              .single();
            
            registradorInfo = registrador;
          }
          
          currentUserData = {
            atleta_id: userData.id,
            nome_atleta: userData.nome_completo,
            email: userData.email,
            telefone: userData.telefone,
            tipo_documento: userData.tipo_documento,
            numero_documento: userData.numero_documento,
            genero: userData.genero,
            numero_identificador: userData.numero_identificador,
            status_confirmacao: userEventRegistration[0].status_confirmacao || 'pendente',
            filial_id: userData.filial_id,
            filial_nome: userData.filiais?.nome || null,
            status_pagamento: paymentInfo?.isento ? 'confirmado' : (paymentInfo?.status_pagamento || 'pendente'),
            isento: paymentInfo?.isento || false,
            usuario_registrador_id: paymentInfo?.usuario_registrador_id,
            registrador_nome: registradorInfo?.nome_completo || null,
            registrador_email: registradorInfo?.email || null,
            modalidades: userModalities?.map(mod => ({
              id: mod.id.toString(),
              modalidade: mod.modalidades?.nome || '',
              status: mod.status || 'pendente',
              justificativa_status: mod.justificativa_status || ''
            })) || []
          };
          
          console.log('Built current user data:', currentUserData);
        }
      }
    }

    // Process main data
    const athletesMap = new Map<string, AthleteManagement>();
    
    // Add current user data first if it exists
    if (currentUserData) {
      const paymentStatus = currentUserData.isento ? 'confirmado' : (currentUserData.status_pagamento || 'pendente');
      
      athletesMap.set(currentUserData.atleta_id, {
        id: currentUserData.atleta_id,
        nome_atleta: currentUserData.nome_atleta,
        email: currentUserData.email,
        telefone: currentUserData.telefone,
        tipo_documento: currentUserData.tipo_documento,
        numero_documento: currentUserData.numero_documento,
        genero: currentUserData.genero,
        numero_identificador: currentUserData.numero_identificador,
        status_confirmacao: currentUserData.status_confirmacao,
        filial_id: currentUserData.filial_id,
        filial_nome: currentUserData.filial_nome,
        status_pagamento: paymentStatus as 'pendente' | 'confirmado' | 'cancelado',
        usuario_registrador_id: currentUserData.usuario_registrador_id,
        registrador_nome: currentUserData.registrador_nome,
        registrador_email: currentUserData.registrador_email,
        modalidades: currentUserData.modalidades,
        evento_id: eventId
      });
    }

    // Process remaining data from view
    if (data) {
      data.forEach(record => {
        console.log('Processing record for athlete ID:', record.atleta_id, 'Current user ID:', user.id);
        
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

    const athletes = Array.from(athletesMap.values());
    console.log('Processed athletes:', athletes.length);
    console.log('Current user in final athletes list:', athletes.find(a => a.id === user.id));
    
    return athletes;
  } catch (error) {
    console.error('Error in fetchAthleteManagement:', error);
    throw error;
  }
};
