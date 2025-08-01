
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { AuthUser, UserRole } from '@/types/auth';
import { toast } from 'sonner';

// Cache para evitar múltiplas consultas do mesmo usuário
const userProfileCache = new Map<string, { data: any; timestamp: number; eventId: string }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const fetchUserProfile = async (userId: string) => {
  try {
    console.log('Fetching user profile data for user:', userId);
    
    // Force clear cache for debugging role issues
    userProfileCache.clear();
    console.log('CLEARED ALL PROFILE CACHE FOR DEBUGGING');
    
    // Get current event ID from localStorage since roles are now event-specific
    const currentEventId = localStorage.getItem('currentEventId');
    console.log('Current event ID:', currentEventId);
    const cacheKey = `${userId}-${currentEventId || 'no-event'}`;
    
    // Verificar cache (disabled for debugging)
    const cached = userProfileCache.get(cacheKey);
    if (false && cached && Date.now() - cached.timestamp < CACHE_DURATION && cached.eventId === currentEventId) {
      console.log('Using cached user profile data');
      return cached.data;
    }
    
    if (!currentEventId) {
      console.log('No current event ID found');
    const { data: userProfile, error: profileError } = await supabase
      .from('usuarios')
      .select('nome_completo, telefone, filial_id, confirmado, master')
      .eq('id', userId)
      .maybeSingle();

      if (profileError) throw profileError;

      if (!userProfile) {
        console.log('No user profile found');
        const result = {
          confirmado: false,
          papeis: [] as UserRole[],
        };
        
        // Cache do resultado
        userProfileCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          eventId: currentEventId || ''
        });
        
        return result;
      }

      const result = {
        ...userProfile,
        papeis: [] as UserRole[],
      };
      
      // Cache do resultado
      userProfileCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        eventId: currentEventId || ''
      });
      
      return result;
    }

    // Use the corrected RPC function to get user profile with roles
    console.log('🔍 Fetching user profile via updated get_user_profile_safe...');
    const { data: profileData, error: profileError } = await supabase
      .rpc('get_user_profile_safe', {
        p_user_id: userId
      });

    if (profileError) {
      console.error('❌ Error fetching user profile via RPC:', profileError);
      console.log('🔄 RPC failed, trying fallback direct queries...');
      
      // Fallback: Try direct queries if RPC fails
      return await fetchUserProfileFallback(userId, currentEventId);
    }

    if (!profileData || profileData.length === 0) {
      console.log('⚠️ No user profile found via RPC');
      const result = {
        confirmado: false,
        papeis: [] as UserRole[],
        master: false,
      };
      
      // Cache do resultado
      userProfileCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        eventId: currentEventId
      });
      
      return result;
    }

    const userProfile = profileData[0];
    console.log('📊 Raw profile data from RPC:', userProfile);
    
    // Handle roles - should come as JSONB from the updated function
    let papeis: UserRole[] = [];
    if (userProfile.papeis) {
      if (typeof userProfile.papeis === 'string') {
        try {
          papeis = JSON.parse(userProfile.papeis);
          console.log('✅ Successfully parsed papeis from string');
        } catch (e) {
          console.error('❌ Error parsing papeis JSON:', e);
          papeis = [];
        }
      } else if (Array.isArray(userProfile.papeis)) {
        papeis = userProfile.papeis;
        console.log('✅ Papeis already in array format');
      } else {
        console.warn('⚠️ Unexpected papeis format:', typeof userProfile.papeis);
        papeis = [];
      }
    }
    
    console.log('=== DETAILED ROLE DEBUG ===');
    console.log('🎭 User roles loaded:', papeis.length);
    console.log('🎭 Raw papeis data:', papeis);
    console.log('🎭 Role codes:', papeis.map((p: any) => p.codigo));
    console.log('🎭 Role names:', papeis.map((p: any) => p.nome));
    console.log('🎭 Current event context:', currentEventId);
    console.log('===========================');
    
    const result = {
      nome_completo: userProfile.nome_completo,
      telefone: userProfile.telefone,
      filial_id: userProfile.filial_id,
      confirmado: userProfile.confirmado || false,
      master: userProfile.master || false,
      papeis,
    };
    
    // Cache do resultado
    userProfileCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
      eventId: currentEventId
    });
    
    return result;
  } catch (error) {
    console.error('Error fetching user profile data');
    throw error;
  }
};

// Função para limpar cache quando necessário
export const clearUserProfileCache = (userId?: string) => {
  if (userId) {
    // Limpar cache específico do usuário
    const keysToDelete = Array.from(userProfileCache.keys()).filter(key => key.startsWith(userId));
    keysToDelete.forEach(key => userProfileCache.delete(key));
    console.log(`Cleared profile cache for user: ${userId}`);
  } else {
    // Limpar todo o cache
    userProfileCache.clear();
    console.log('Cleared all profile cache');
  }
};

// Force clear all cache (for troubleshooting)
export const forceClearAllCache = () => {
  userProfileCache.clear();
  console.log('FORCE CLEARED ALL PROFILE CACHE');
};

// Fallback function for when RPC fails
const fetchUserProfileFallback = async (userId: string, currentEventId: string) => {
  console.log('=== FALLBACK USER PROFILE FETCH ===');
  console.log('userId:', userId, 'eventId:', currentEventId);
  
  try {
    // Fetch basic user data
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('nome_completo, telefone, filial_id, confirmado, master')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data in fallback:', userError);
      throw userError;
    }

    // Fetch user roles for the event
    const { data: rolesData, error: rolesError } = await supabase
      .from('papeis_usuarios')
      .select(`
        perfil_id,
        perfis!inner (
          nome,
          perfis_tipo!inner (
            codigo,
            nome
          )
        )
      `)
      .eq('usuario_id', userId)
      .eq('evento_id', currentEventId);

    if (rolesError) {
      console.error('Error fetching roles in fallback:', rolesError);
      // Continue without roles rather than failing
    }

    const papeis = rolesData?.map((role: any) => ({
      nome: role.perfis?.perfis_tipo?.nome || 'Unknown',
      codigo: role.perfis?.perfis_tipo?.codigo || 'UNK',
      descricao: null
    })) || [];

    console.log('Fallback roles found:', papeis);
    console.log('Fallback role codes:', papeis.map(p => p.codigo));

    const result = {
      nome_completo: userData.nome_completo,
      telefone: userData.telefone,
      filial_id: userData.filial_id,
      confirmado: userData.confirmado,
      master: userData.master || false,
      papeis,
    };

    console.log('Fallback result:', result);
    return result;

  } catch (error) {
    console.error('Error in fallback user profile fetch:', error);
    // Return minimal profile to prevent complete failure
    return {
      nome_completo: null,
      telefone: null,
      filial_id: null,
      confirmado: false,
      papeis: [],
    };
  }
};

export const handleAuthRedirect = (userProfile: any, pathname: string, navigate: Function) => {
  console.log('Processing auth redirect...');
  
  // Don't redirect if we're on the reset-password page and came from profile
  if (pathname === '/reset-password') {
    console.log('Skipping redirect for password reset page');
    return;
  }
  
  // If user is on a public route, redirect to event selection
  if (['/login', '/', '/forgot-password'].includes(pathname)) {
    console.log('Redirecting to event selection');
    navigate('/event-selection');
  }
};
