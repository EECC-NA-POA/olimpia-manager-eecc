
import { supabase } from '../../supabase';
import { UserProfileData, UserRole, UserPayment } from './types';

export const fetchUserProfiles = async (eventId: string | null): Promise<UserProfileData[]> => {
  console.log('Fetching user profiles for event:', eventId);
  
  if (!eventId) {
    console.warn('No event ID provided for fetching user profiles');
    return [];
  }

  // Query all users registered in this event through papeis_usuarios
  console.log('========== STARTING QUERY ==========');
  console.log('Querying papeis_usuarios for event:', eventId);
  console.log('Event ID type:', typeof eventId);
  
  const { data: userRoles, error: userRolesError } = await supabase
    .from('papeis_usuarios')
    .select('*') // Get all columns to debug
    .eq('evento_id', eventId);
    
  console.log('========== PAPEIS_USUARIOS RESULT ==========');
  console.log('Raw papeis_usuarios query result:', userRoles);
  console.log('Number of records found:', userRoles?.length || 0);
  console.log('papeis_usuarios query error:', userRolesError);
  console.log('============================================');

  if (userRolesError) {
    console.error('Error fetching user roles:', userRolesError);
    throw userRolesError;
  }

  if (!userRoles || userRoles.length === 0) {
    console.log('No users found for this event');
    return [];
  }

  // Extract the unique user IDs from the user roles
  const userIds = [...new Set(userRoles.map(role => role.usuario_id))];
  console.log(`Found ${userIds.length} unique users for event ${eventId}:`, userIds);
  console.log('UserRoles data:', userRoles);
  
  // Filter out null/undefined userIds to avoid query issues
  const validUserIds = userIds.filter(id => id != null && id !== '');
  console.log(`Valid user IDs after filtering: ${validUserIds.length}`, validUserIds);
  
  if (validUserIds.length === 0) {
    console.warn('No valid user IDs found after filtering');
    return [];
  }

  // Now fetch the detailed user information for these users
  console.log('Executing users query with IDs:', validUserIds);
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
    .in('id', validUserIds)
    .order('nome_completo');

  if (usersError) {
    console.error('Error fetching users:', usersError);
    throw usersError;
  }

  console.log('Raw users data:', users);
  console.log('Number of users fetched:', users?.length || 0);

  if (!users || users.length === 0) {
    console.warn('No users found with the registered IDs');
    return [];
  }

  // Fetch user profiles for this event
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

  if (profilesError) {
    console.error('Error fetching user profiles:', profilesError);
    throw profilesError;
  }

  console.log('All user profiles data:', allUserProfiles);

  // Filter profiles for registered users only
  const userProfiles = allUserProfiles?.filter(profile => 
    validUserIds.includes(profile.usuario_id)
  ) || [];

  console.log('Filtered user profiles data:', userProfiles);

  // Fetch payments for these users - using atleta_id instead of usuario_id
  const { data: userPayments, error: paymentsError } = await supabase
    .from('pagamentos')
    .select(`
      atleta_id,
      status,
      valor,
      data_criacao
    `)
    .eq('evento_id', eventId)
    .in('atleta_id', validUserIds)
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

    // Get the user's payments - using atleta_id for matching
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
};
