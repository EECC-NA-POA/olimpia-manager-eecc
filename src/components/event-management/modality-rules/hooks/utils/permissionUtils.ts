
import { supabase } from '@/lib/supabase';

export const checkUserPermissions = async (eventId: string) => {
  console.log('Checking user permissions...');
  
  // First, let's check the current user's permissions
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error('Error getting current user:', userError);
    throw new Error('Erro ao verificar usuário atual');
  }
  
  console.log('Current user ID:', user?.id);
  
  // Check user permissions more thoroughly
  const { data: userPermissions, error: permError } = await supabase
    .from('papeis_usuarios')
    .select(`
      perfis!inner(
        nome,
        perfil_tipo_id,
        perfis_tipo!inner(
          codigo,
          descricao
        )
      )
    `)
    .eq('usuario_id', user?.id)
    .eq('evento_id', eventId);
  
  if (permError) {
    console.error('Error checking permissions:', permError);
  } else {
    console.log('User permissions detailed:', userPermissions);
    
    // Log each permission for debugging
    userPermissions?.forEach((permission: any, index: number) => {
      console.log(`Permission ${index + 1}:`, {
        nome: permission.perfis?.nome,
        perfil_tipo_id: permission.perfis?.perfil_tipo_id,
        codigo: permission.perfis?.perfis_tipo?.codigo,
        descricao: permission.perfis?.perfis_tipo?.descricao
      });
    });
  }
  
  // Verify admin permission exists
  const hasAdminPermission = userPermissions?.some((permission: any) => 
    permission.perfis?.perfis_tipo?.codigo === 'ADM'
  );
  
  console.log('Has admin permission:', hasAdminPermission);
  
  if (!hasAdminPermission) {
    throw new Error('Você não tem permissão para criar baterias. Verifique suas permissões.');
  }
  
  return { user, hasAdminPermission };
};
