
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
        .select('nome_completo, telefone, filial_id, confirmado')
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

    // Use RPC function to bypass RLS issues
    const { data: profileData, error: profileError } = await supabase
      .rpc('get_user_profile_safe', {
        p_user_id: userId,
        p_event_id: currentEventId
      });

    if (profileError) {
      console.error('Error fetching user profile via RPC:', profileError);
      throw profileError;
    }

    if (!profileData || profileData.length === 0) {
      console.log('No user profile found');
      const result = {
        confirmado: false,
        papeis: [] as UserRole[],
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
    const papeis = Array.isArray(userProfile.papeis) ? userProfile.papeis : [];
    
    console.log('=== DETAILED ROLE DEBUG ===');
    console.log('User roles loaded:', papeis.length);
    console.log('Raw papeis data:', papeis);
    console.log('Role codes:', papeis.map((p: any) => p.codigo));
    console.log('Role names:', papeis.map((p: any) => p.nome));
    console.log('===========================');
    
    const result = {
      nome_completo: userProfile.nome_completo,
      telefone: userProfile.telefone,
      filial_id: userProfile.filial_id,
      confirmado: userProfile.confirmado,
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
