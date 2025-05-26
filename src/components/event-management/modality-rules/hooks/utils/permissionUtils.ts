
import { supabase } from '@/lib/supabase';

export const checkUserPermissions = async (eventId: string) => {
  console.log('Checking user permissions for event:', eventId);
  
  // First, let's check the current user's permissions
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error('Error getting current user:', userError);
    throw new Error('Erro ao verificar usuário atual');
  }
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }
  
  console.log('Current user ID:', user.id);
  
  // Check user permissions by looking for 'Administração' profile name
  const { data: userPermissions, error: permError } = await supabase
    .from('papeis_usuarios')
    .select(`
      perfis!inner(
        nome,
        descricao,
        perfil_tipo_id
      )
    `)
    .eq('usuario_id', user.id)
    .eq('evento_id', eventId);
  
  if (permError) {
    console.error('Error checking permissions:', permError);
    throw new Error(`Erro ao verificar permissões: ${permError.message}`);
  }
  
  console.log('User permissions detailed:', userPermissions);
  
  // Log each permission for debugging
  userPermissions?.forEach((permission: any, index: number) => {
    console.log(`Permission ${index + 1}:`, {
      nome: permission.perfis?.nome,
      descricao: permission.perfis?.descricao,
      perfil_tipo_id: permission.perfis?.perfil_tipo_id
    });
  });
  
  // Verify admin permission by checking for 'Administração' in profile name
  const hasAdminPermission = userPermissions?.some((permission: any) => 
    permission.perfis?.nome === 'Administração'
  );
  
  console.log('Has admin permission:', hasAdminPermission);
  
  if (!hasAdminPermission) {
    throw new Error(`Você não tem permissão administrativa para este evento. Usuário: ${user.id}, Evento: ${eventId}`);
  }
  
  return { user, hasAdminPermission };
};
