
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
              justificativa_status: record.justificativa_status || '',
              inscrito_por: record.inscrito_por || null,
              tipo_inscricao: record.tipo_inscricao || null,
              inscrito_por_nome: record.inscrito_por_nome || null
            });
          }
        }
      });
    }

    // Get ALL athletes registered for this event (not just from view)
    console.log('Fetching ALL athletes registered for event...');
    
    const { data: allEventAthletes, error: allAthletesError } = await supabase
      .from('inscricoes_eventos')
      .select(`
        usuario_id,
        status_confirmacao,
        status_pagamento,
        isento,
        usuario_registrador_id
      `)
      .eq('evento_id', eventId);
    
    if (allAthletesError) {
      console.error('Error fetching all event athletes:', allAthletesError);
    } else {
      console.log('All event athletes count:', allEventAthletes?.length);
      
      // Process each athlete that's not already in the map
      for (const eventReg of allEventAthletes || []) {
        if (!athletesMap.has(eventReg.usuario_id)) {
          console.log('Adding missing athlete:', eventReg.usuario_id);
          
          // Apply branch filter if needed
          if (filterByBranch && userBranchId) {
            const { data: athleteProfile } = await supabase
              .from('usuarios')
              .select('filial_id')
              .eq('id', eventReg.usuario_id)
              .single();
            
            // Skip if athlete is not from the same branch
            if (athleteProfile?.filial_id !== userBranchId) {
              console.log('Skipping athlete due to branch filter:', eventReg.usuario_id);
              continue;
            }
          }
          
          // Get athlete's complete profile data
          const { data: athleteData, error: athleteDataError } = await supabase
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
            .eq('id', eventReg.usuario_id)
            .single();
          
          if (athleteDataError) {
            console.error('Error fetching athlete data:', athleteDataError);
            continue;
          }
          
          if (!athleteData) continue;
          
          // Get filial data
          let filialData = null;
          if (athleteData.filial_id) {
            const { data: filial } = await supabase
              .from('filiais')
              .select('nome')
              .eq('id', athleteData.filial_id)
              .single();
            filialData = filial;
          }
          
          // Get athlete's modalities for this event
          const { data: athleteModalities } = await supabase
            .from('inscricoes_modalidades')
            .select(`
              id,
              status,
              justificativa_status,
              modalidades (nome)
            `)
            .eq('atleta_id', eventReg.usuario_id)
            .eq('evento_id', eventId);
          
          // Get registrador info if exists
          let registradorInfo = null;
          if (eventReg.usuario_registrador_id && eventReg.usuario_registrador_id !== eventReg.usuario_id) {
            const { data: registrador } = await supabase
              .from('usuarios')
              .select('nome_completo, email')
              .eq('id', eventReg.usuario_registrador_id)
              .single();
            
            registradorInfo = registrador;
          }
          
          const paymentStatus = eventReg.isento ? 'confirmado' : (eventReg.status_pagamento || 'pendente');
          
          athletesMap.set(eventReg.usuario_id, {
            id: athleteData.id,
            nome_atleta: athleteData.nome_completo,
            email: athleteData.email,
            telefone: athleteData.telefone,
            tipo_documento: athleteData.tipo_documento,
            numero_documento: athleteData.numero_documento,
            genero: athleteData.genero,
            numero_identificador: athleteData.numero_identificador,
            status_confirmacao: eventReg.status_confirmacao || false,
            filial_id: athleteData.filial_id,
            filial_nome: filialData?.nome || null,
            status_pagamento: paymentStatus as 'pendente' | 'confirmado' | 'cancelado',
            usuario_registrador_id: eventReg.usuario_registrador_id,
            registrador_nome: registradorInfo?.nome_completo || null,
            registrador_email: registradorInfo?.email || null,
            modalidades: athleteModalities?.map(mod => ({
              id: mod.id.toString(),
              modalidade: (mod.modalidades as any)?.nome || '',
              status: mod.status || 'pendente',
              justificativa_status: mod.justificativa_status || ''
            })) || [],
            evento_id: eventId
          });
          
          console.log('Successfully added athlete to map:', athleteData.nome_completo);
        }
      }
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
