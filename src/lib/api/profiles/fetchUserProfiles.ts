
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

    // Now fetch the detailed user information for these users
    console.log('===== QUERYING USUARIOS TABLE =====');
    console.log('User IDs to fetch:', userIds);
    
    const { data: users, error: usersError } = await supabase
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

    console.log('===== USUARIOS QUERY RESULT =====');
    console.log('Users data:', users);
    console.log('Users error:', usersError);
    console.log('Number of users fetched:', users?.length || 0);
    console.log('Expected vs actual count:', userIds.length, 'vs', users?.length || 0);
    console.log('==================================');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    console.log('Users data:', users);
    console.log('Number of users fetched:', users?.length || 0);

    if (!users || users.length === 0) {
      console.warn('No users found with the registered IDs');
      return [];
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
        filial_nome: user.filiais?.nome || 'Sem filial',
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
