
import { supabase } from '../../supabase';
import { UserProfileData, UserRole, UserPayment } from './types';

export const fetchUserProfiles = async (eventId: string | null): Promise<UserProfileData[]> => {
  console.log('===== FETCHUSERPROFILES START =====');
  console.log('Event ID:', eventId);
  console.log('Event ID type:', typeof eventId);
  
  if (!eventId) {
    console.warn('===== NO EVENT ID - RETURNING EMPTY =====');
    return [];
  }

  console.log('===== STARTING COMBINED USER QUERY =====');
  try {
    // First, check how many users are registered in this event via inscricoes_eventos
    const { data: registeredUsers, error: inscricoesError } = await supabase
      .from('inscricoes_eventos')
      .select('usuario_id')
      .eq('evento_id', eventId);

    console.log('===== INSCRICOES_EVENTOS CHECK =====');
    console.log('Registered users data:', registeredUsers);
    console.log('Error:', inscricoesError);
    console.log('Total registered users count:', registeredUsers?.length || 0);
    console.log('=====================================');

    // Get all users who have any profile/role in this event
    const { data: allUserProfiles, error: profilesError } = await supabase
      .from('papeis_usuarios')
      .select(`
        usuario_id,
        perfil_id,
        perfis:perfil_id (
          nome
        )
      `)
      .eq('evento_id', eventId);

    console.log('===== PAPEIS_USUARIOS RESULT =====');
    console.log('Data:', allUserProfiles);
    console.log('Error:', profilesError);
    console.log('Count:', allUserProfiles?.length || 0);
    console.log('====================================');

    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
      throw profilesError;
    }

    // Combine users from both inscricoes_eventos and papeis_usuarios
    const registeredUserIds = registeredUsers?.map(r => r.usuario_id) || [];
    const profileUserIds = allUserProfiles?.map(profile => profile.usuario_id) || [];
    
    // Get unique user IDs from both sources
    const allUserIds = [...new Set([...registeredUserIds, ...profileUserIds])];
    
    console.log('===== USER ID ANALYSIS =====');
    console.log('Registered user IDs:', registeredUserIds);
    console.log('Profile user IDs:', profileUserIds);
    console.log('Combined unique user IDs:', allUserIds);
    console.log('Total unique users:', allUserIds.length);
    console.log('=============================');

    if (allUserIds.length === 0) {
      console.log('No users found for this event (neither registered nor with profiles)');
      return [];
    }

    const userIds = allUserIds;
    console.log(`Found ${userIds.length} unique users for event ${eventId}:`, userIds);

    // Try multiple approaches to fetch user data
    console.log('===== QUERYING USUARIOS TABLE =====');
    console.log('User IDs to fetch:', userIds);
    
    let users: any[] = [];
    let usersError: any = null;
    
    // Approach 1: Direct query to usuarios table
    try {
      console.log('🔄 Trying direct query to usuarios table...');
      const { data: directUsers, error: directError } = await supabase
        .from('usuarios')
        .select(`
          id,
          nome_completo,
          email,
          numero_documento,
          tipo_documento,
          filial_id,
          data_criacao,
          filiais:filial_id (
            nome
          )
        `)
        .in('id', userIds)
        .order('nome_completo');

      users = directUsers || [];
      usersError = directError;
      console.log('Direct query result:', { users: users.length, error: directError });
    } catch (error) {
      console.error('Direct query failed:', error);
      usersError = error;
    }

    // Approach 2: Join via inscricoes_eventos if direct approach fails
    if (!users || users.length < userIds.length) {
      console.log('🔄 Trying join via inscricoes_eventos...');
      
      try {
        const { data: joinedUsers, error: joinError } = await supabase
          .from('inscricoes_eventos')
          .select(`
            usuario_id,
            usuarios:usuario_id(
              id,
              nome_completo,
              email,
              numero_documento,
              tipo_documento,
              filial_id,
              data_criacao,
              filiais:filial_id (
                nome
              )
            )
          `)
          .eq('evento_id', eventId)
          .in('usuario_id', userIds);

        if (!joinError && joinedUsers) {
          const alternativeUsers = joinedUsers
            .filter(item => item.usuarios)
            .map(item => item.usuarios);
          
          console.log('Join via inscricoes_eventos result:', { users: alternativeUsers.length });
          
          if (alternativeUsers.length > users.length) {
            users = alternativeUsers;
            usersError = null;
            console.log('✅ Join approach yielded more results');
          }
        }
      } catch (alternativeError) {
        console.error('Join query failed:', alternativeError);
      }
    }

    // Approach 3: Join via papeis_usuarios if still missing users
    if (!users || users.length < userIds.length) {
      console.log('🔄 Trying join via papeis_usuarios...');
      
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('papeis_usuarios')
          .select(`
            usuario_id,
            usuarios:usuario_id(
              id,
              nome_completo,
              email,
              numero_documento,
              tipo_documento,
              filial_id,
              data_criacao,
              filiais:filial_id (
                nome
              )
            )
          `)
          .eq('evento_id', eventId)
          .in('usuario_id', userIds);

        if (!fallbackError && fallbackData) {
          const fallbackUsers = fallbackData
            .filter(item => item.usuarios)
            .map(item => item.usuarios)
            .filter((user: any, index: number, self: any[]) => 
              index === self.findIndex((u: any) => u.id === user.id)
            ); // Remove duplicates
          
          console.log('Join via papeis_usuarios result:', { users: fallbackUsers.length });
          
          if (fallbackUsers.length > users.length) {
            users = fallbackUsers;
            usersError = null;
            console.log('✅ Fallback approach yielded more results');
          }
        }
      } catch (fallbackError) {
        console.error('Fallback query failed:', fallbackError);
      }
    }

    console.log('===== FINAL USUARIOS QUERY RESULT =====');
    console.log('Final users count:', users?.length || 0);
    console.log('Expected vs actual count:', userIds.length, 'vs', users?.length || 0);
    console.log('Final error status:', usersError);
    console.log('========================================');

    if (usersError && (!users || users.length === 0)) {
      console.error('Error fetching users after all attempts:', usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      console.warn('⚠️ NO USERS FOUND AFTER ALL ATTEMPTS');
      console.warn('Expected:', userIds.length, 'users but got:', users?.length || 0);
      console.warn('Missing user IDs:', userIds);
      console.warn('Possible causes:');
      console.warn('1. RLS policy preventing access to usuarios table');
      console.warn('2. Users exist in events but not in usuarios table');
      console.warn('3. Database inconsistency');
      return [];
    }

    if (users.length < userIds.length) {
      const foundUserIds = users.map(u => u.id);
      const missingUserIds = userIds.filter(id => !foundUserIds.includes(id));
      console.warn('⚠️ SOME USERS STILL MISSING AFTER ALL ATTEMPTS');
      console.warn('Expected:', userIds.length, 'but found:', users.length);
      console.warn('Missing user IDs:', missingUserIds);
      console.warn('This suggests RLS policy or data inconsistency issues');
      
      // Continue with partial data instead of failing completely
      console.log('📋 Continuing with partial user data...');
    }

    // Use the existing allUserProfiles data we already fetched
    console.log('Using existing user profiles data:', allUserProfiles);

    // Filter profiles for fetched users only (should be all of them since we got userIds from profiles)
    const userProfiles = allUserProfiles?.filter(profile => 
      userIds.includes(profile.usuario_id)
    ) || [];

    console.log('Filtered user profiles data:', userProfiles);

    // Fetch payments for these users
    const { data: userPayments, error: paymentsError } = await supabase
      .from('pagamentos')
      .select(`
        atleta_id,
        status,
        valor,
        data_criacao
      `)
      .eq('evento_id', eventId)
      .in('atleta_id', userIds)
      .order('data_criacao', { ascending: false });

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      // Don't throw error for payments, just log it
    }

    console.log('User payments data:', userPayments);

    const formattedUsers = users.map((user: any) => {
      // Get the user's roles for this event
      const eventRoles = userProfiles?.filter((papel: any) => 
        papel.usuario_id === user.id
      ) || [];

      // Get the user's payments
      const userPaymentsList = userPayments?.filter((payment: any) => 
        payment.atleta_id === user.id
      ) || [];

      // Get the most recent payment status
      const latestPayment = userPaymentsList.length > 0 ? userPaymentsList[0] : null;

      const formattedUser = {
        id: user.id,
        nome_completo: user.nome_completo,
        email: user.email,
        numero_documento: user.numero_documento,
        tipo_documento: user.tipo_documento,
        filial_id: user.filial_id,
        created_at: user.data_criacao,
        filial_nome: user.filiais?.[0]?.nome || 'Sem filial',
        profiles: eventRoles.map((papel: any) => ({
          perfil_id: papel.perfil_id,
          perfil_nome: papel.perfis?.nome || ''
        })),
        pagamentos: userPaymentsList.map((pagamento: any) => ({
          status: pagamento.status,
          valor: pagamento.valor,
          created_at: pagamento.data_criacao
        })),
        // Add latest payment status for easy access
        status_pagamento: latestPayment?.status || 'pendente'
      };

      console.log(`Formatted user ${user.nome_completo}:`, formattedUser);
      return formattedUser;
    });

    console.log('Final formatted users count:', formattedUsers.length);
    console.log('All formatted users:', formattedUsers);
    return formattedUsers;
  } catch (error) {
    console.error('Error in fetchUserProfiles:', error);
    throw error;
  }
};
