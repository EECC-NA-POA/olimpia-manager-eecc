
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

    // First, let's check if the current user is registered in the event
    const { data: userEventRegistration } = await supabase
      .from('inscricoes_eventos')
      .select('*')
      .eq('usuario_id', user.id)
      .eq('evento_id', eventId);
    
    console.log('User event registration check:', userEventRegistration);

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

    if (!data) {
      console.log('No athletes data returned');
      return [];
    }

    const athletesMap = new Map<string, AthleteManagement>();

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

    const athletes = Array.from(athletesMap.values());
    console.log('Processed athletes:', athletes.length);
    console.log('Current user in final athletes list:', athletes.find(a => a.id === user.id));
    
    return athletes;
  } catch (error) {
    console.error('Error in fetchAthleteManagement:', error);
    throw error;
  }
};
