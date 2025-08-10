import { supabase } from '@/lib/supabase';

export interface PermissionValidationResult {
  isValid: boolean;
  userRole: string | null;
  filialId: string | null;
  errorMessage?: string;
}

/**
 * Validates if the current user has permission to manage representatives
 * Checks for 'Representante de Delegação' or 'Administração' profiles
 */
export const validateRepresentativePermission = async (eventId: string, expectedFilialId?: string): Promise<PermissionValidationResult> => {
  console.log('=== VALIDATING REPRESENTATIVE PERMISSION ===');
  console.log('Parameters:', { eventId, expectedFilialId });
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return {
        isValid: false,
        userRole: null,
        filialId: null,
        errorMessage: 'Usuário não autenticado'
      };
    }

    console.log('Checking permissions for user:', { userId: user.id, email: user.email });

    // Get user's profile information
    const { data: userProfile, error: profileError } = await supabase
      .from('usuarios')
      .select('filial_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return {
        isValid: false,
        userRole: null,
        filialId: null,
        errorMessage: 'Erro ao buscar perfil do usuário'
      };
    }

    console.log('User profile:', userProfile);

    // Check user roles for this event
    const { data: userRoles, error: rolesError } = await supabase
      .from('papeis_usuarios')
      .select(`
        perfis!inner(
          nome,
          descricao
        )
      `)
      .eq('usuario_id', user.id)
      .eq('evento_id', eventId);

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError);
      return {
        isValid: false,
        userRole: null,
        filialId: userProfile?.filial_id || null,
        errorMessage: 'Erro ao verificar permissões'
      };
    }

    console.log('User roles for event:', userRoles);

    // Determine effective role with admin precedence
    const roleNames = (userRoles || []).map((role: any) => {
      const perfil = Array.isArray(role.perfis) ? role.perfis[0] : role.perfis;
      return perfil?.nome as string | undefined;
    }).filter(Boolean);

    const roleName = roleNames.includes('Administração')
      ? 'Administração'
      : (roleNames.includes('Representante de Delegação') ? 'Representante de Delegação' : null);

    if (!roleName) {
      console.log('User does not have valid role for representative management');
      return {
        isValid: false,
        userRole: null,
        filialId: userProfile?.filial_id || null,
        errorMessage: 'Você não possui permissão para gerenciar representantes. É necessário ter o perfil "Representante de Delegação" ou "Administração".'
      };
    }

    console.log('User has valid role:', roleName);

    // For Representante de Delegação, validate filial match
    if (roleName === 'Representante de Delegação' && expectedFilialId && userProfile?.filial_id !== expectedFilialId) {
      console.log('Filial mismatch for Representante de Delegação:', {
        userFilial: userProfile?.filial_id,
        expectedFilial: expectedFilialId
      });
      return {
        isValid: false,
        userRole: roleName,
        filialId: userProfile?.filial_id || null,
        errorMessage: 'Você só pode gerenciar representantes da sua própria filial.'
      };
    }

    console.log('Permission validation successful');
    return {
      isValid: true,
      userRole: roleName,
      filialId: userProfile?.filial_id || null
    };

  } catch (error) {
    console.error('Exception in validateRepresentativePermission:', error);
    return {
      isValid: false,
      userRole: null,
      filialId: null,
      errorMessage: 'Erro inesperado ao validar permissões'
    };
  }
};