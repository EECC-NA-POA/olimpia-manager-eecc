
import { supabase } from '../../supabase';
import { UserProfileData, UserRole, UserPayment } from './types';

export const fetchUserProfiles = async (eventId: string | null): Promise<UserProfileData[]> => {
  console.log('Fetching user profiles for event:', eventId);
  
  if (!eventId) {
    console.warn('No event ID provided for fetching user profiles');
    return [];
  }

  // Query all users registered in this event through inscricoes_eventos
  const { data: registeredUsers, error: registeredUsersError } = await supabase
    .from('inscricoes_eventos')
    .select('usuario_id')
    .eq('evento_id', eventId);

  if (registeredUsersError) {
    console.error('Error fetching registered users:', registeredUsersError);
    throw registeredUsersError;
  }

  if (!registeredUsers || registeredUsers.length === 0) {
    console.log('No registered users found for this event');
    return [];
  }

  // Extract the user IDs from the registered users
  const userIds = registeredUsers.map(registration => registration.usuario_id);
  console.log(`Found ${userIds.length} registered users for event ${eventId}:`, userIds);

  // Now fetch the detailed user information for these users
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

  // Fetch user profiles for this event separately
  const { data: userProfiles, error: profilesError } = await supabase
    .from('papeis_usuarios')
    .select(`
      usuario_id,
      perfil_id,
      perfis:perfil_id (
        nome
      )
    `)
    .eq('evento_id', eventId)
    .in('usuario_id', userIds);

  if (profilesError) {
    console.error('Error fetching user profiles:', profilesError);
    throw profilesError;
  }

  console.log('User profiles data:', userProfiles);

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
