import { supabase } from '@/lib/supabase';

/**
 * Validates if the current user has administrative permissions for an event
 * @param eventId - The event ID to check permissions for
 * @returns Promise<boolean> - True if user has admin permissions
 */
export const validateAdminPermission = async (eventId: string): Promise<boolean> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return false;
    }

    // Check if user has 'Administração' role for this event
    const { data: adminRoles, error: roleError } = await supabase
      .from('papeis_usuarios')
      .select(`
        perfis!inner(
          nome
        )
      `)
      .eq('usuario_id', user.id)
      .eq('evento_id', eventId);

    if (roleError) {
      console.error('Error checking admin permissions:', roleError);
      return false;
    }

    return adminRoles?.some((role: any) => 
      role.perfis?.nome === 'Administração'
    ) || false;
  } catch (error) {
    console.error('Exception in validateAdminPermission:', error);
    return false;
  }
};

/**
 * Validates if a user can modify another user's profile
 * @param targetUserId - The user ID being modified
 * @param eventId - The event ID for the modification
 * @returns Promise<boolean> - True if modification is allowed
 */
export const validateProfileModification = async (
  targetUserId: string, 
  eventId: string
): Promise<boolean> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return false;

    // Users can always modify their own profiles
    if (user.id === targetUserId) return true;

    // Otherwise, must be admin for this event
    return await validateAdminPermission(eventId);
  } catch (error) {
    console.error('Exception in validateProfileModification:', error);
    return false;
  }
};

/**
 * Prevents privilege escalation by validating profile assignments
 * @param profileIds - Array of profile IDs being assigned
 * @param eventId - The event ID for the assignment
 * @returns Promise<boolean> - True if assignment is safe
 */
export const validateProfileAssignment = async (
  profileIds: number[], 
  eventId: string
): Promise<boolean> => {
  try {
    // Check if any of the profiles being assigned are administrative
    const { data: profiles, error } = await supabase
      .from('perfis')
      .select('nome, id')
      .in('id', profileIds);

    if (error) {
      console.error('Error validating profile assignment:', error);
      return false;
    }

    const hasAdminProfile = profiles?.some(profile => profile.nome === 'Administração');
    
    // If assigning admin profile, must be admin themselves
    if (hasAdminProfile) {
      return await validateAdminPermission(eventId);
    }

    return true;
  } catch (error) {
    console.error('Exception in validateProfileAssignment:', error);
    return false;
  }
};
