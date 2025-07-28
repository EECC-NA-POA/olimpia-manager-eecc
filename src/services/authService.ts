
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { AuthUser, UserRole } from '@/types/auth';
import { toast } from 'sonner';

// Cache para evitar múltiplas consultas do mesmo usuário
const userProfileCache = new Map<string, { data: any; timestamp: number; eventId: string }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const fetchUserProfile = async (userId: string) => {
  try {
    console.log('Fetching user profile data for user:', userId);
    
    // Get current event ID from localStorage since roles are now event-specific
    const currentEventId = localStorage.getItem('currentEventId');
    const cacheKey = `${userId}-${currentEventId || 'no-event'}`;
    
    // Verificar cache
    const cached = userProfileCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION && cached.eventId === currentEventId) {
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

    // Buscar perfil do usuário e roles em paralelo
    const [userProfileResult, userRolesResult] = await Promise.all([
      supabase
        .from('usuarios')
        .select('nome_completo, telefone, filial_id, confirmado')
        .eq('id', userId)
        .maybeSingle(),
      supabase
        .from('papeis_usuarios')
        .select(`
          perfis (
            id,
            nome,
            perfil_tipo_id,
            perfis_tipo (
              codigo,
              descricao
            )
          )
        `)
        .eq('usuario_id', userId)
        .eq('evento_id', currentEventId)
    ]);

    if (userProfileResult.error) throw userProfileResult.error;
    if (userRolesResult.error) throw userRolesResult.error;

    if (!userProfileResult.data) {
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

    const papeis = userRolesResult.data?.map((ur: any) => ({
      nome: ur.perfis?.nome || 'Perfil sem nome',
      codigo: ur.perfis?.perfis_tipo?.codigo || 'unknown',
      descricao: ur.perfis?.perfis_tipo?.descricao || 'Descrição não disponível'
    })).filter((papel: any) => papel.codigo !== 'unknown') as UserRole[] || [];
    
    console.log('User roles loaded:', papeis.length);
    
    const result = {
      ...userProfileResult.data,
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
  } else {
    // Limpar todo o cache
    userProfileCache.clear();
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
