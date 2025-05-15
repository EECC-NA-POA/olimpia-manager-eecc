
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sb.nova-acropole.org.br/';
const supabaseAnonKey = 'x9Ll0f6bKmCBQWXGrBHtH4zPxEht0Of7XShBxUV8IkJPF8GKjXK4VKeTTt0bAMvbWcF7zUOZA02pdbLahz9Z4eFzhk6EVPwflciK5HasI7Cm7zokA4y3Sg8EG34qseUQZGTUiTjTAf9idr6mcdEEPdKSUvju6PwLJxLRjSF3oRRF6KTHrPyWpyY5rJs7m7QCFd1uMOSBQ7gY4RtTMydqWAgIHJJhxTPxC49A2rMuB0Z';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'olimpics_auth_token',
    storage: localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'lovable-app'
    }
  }
});

// Add error handling helper
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  if (error.message?.includes('refresh_token_not_found') || error.message?.includes('JWT')) {
    console.log('Token issue detected, clearing session');
    try {
      // Try to clear the session properly
      supabase.auth.signOut();
    } catch (e) {
      console.error('Error during signout:', e);
    }
    
    // Remove the token from localStorage directly as a fallback
    localStorage.removeItem('olimpics_auth_token');
    return 'Sua sessão expirou. Por favor, faça login novamente.';
  }
  
  if (error.message?.includes('Invalid login credentials')) {
    return 'Email ou senha incorretos.';
  }
  
  if (error.message?.includes('Email not confirmed')) {
    return 'Por favor, confirme seu email antes de fazer login.';
  }
  
  if (error.message?.includes('network')) {
    return 'Erro de conexão. Verifique sua internet.';
  }
  
  return error.message || 'Ocorreu um erro inesperado.';
};

// Initialize Supabase auth state with better error handling
export const initializeSupabase = async () => {
  try {
    // Check for and clean up any potentially corrupted tokens
    try {
      const item = localStorage.getItem('olimpics_auth_token');
      if (item) {
        try {
          const parsed = JSON.parse(item);
          if (!parsed || !parsed.access_token || typeof parsed.access_token !== 'string') {
            console.log('Invalid auth token format found, clearing session');
            localStorage.removeItem('olimpics_auth_token');
          }
        } catch (e) {
          // If we can't parse the token, it's invalid
          console.error('Error parsing auth token, clearing session', e);
          localStorage.removeItem('olimpics_auth_token');
        }
      }
    } catch (e) {
      console.error('Error checking local storage:', e);
    }
    
    // Try to get the session
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      await supabase.auth.signOut();
      localStorage.removeItem('olimpics_auth_token');
    }
  } catch (error) {
    console.error('Error initializing Supabase:', error);
    // Safe cleanup
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('olimpics_auth_token');
    } catch (e) {
      console.error('Error during cleanup:', e);
    }
  }
};

// Call initialize on import
initializeSupabase();

// Add recovery helper for user session
export const recoverSession = async () => {
  try {
    console.log('Attempting to recover session...');
    await initializeSupabase(); // Make sure we're starting clean
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error recovering session:', error);
      throw error;
    }
    
    if (session) {
      console.log('Session recovered successfully');
      return session;
    }
    
    console.log('No active session found');
    return null;
  } catch (error) {
    console.error('Error in session recovery:', error);
    return null;
  }
};
