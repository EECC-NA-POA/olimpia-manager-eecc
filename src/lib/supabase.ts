
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://sb.nova-acropole.org.br/";
const supabaseAnonKey = 'x9Ll0f6bKmCBQWXGrBHtH4zPxEht0Of7XShBxUV8IkJPF8GKjXK4VKeTTt0bAMvbWcF7zUOZA02pdbLahz9Z4eFzhk6EVPwflciK5HasI7Cm7zokA4y3Sg8EG34qseUQZGTUiTjTAf9idr6mcdEEPdKSUvju6PwLJxLRjSF3oRRF6KTHrPyWpyY5rJs7m7QCFd1uMOSBQ7gY4RtTMydqWAgIHJJhxTPxC49A2rMuB0Z;

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
  
  if (error.message?.includes('refresh_token_not_found')) {
    console.log('Refresh token not found, clearing session');
    supabase.auth.signOut();
    return 'Sua sessão expirou. Por favor, faça login novamente.';
  }
  
  if (error.message?.includes('Invalid login credentials')) {
    return 'Email ou senha incorretos.';
  }
  
  if (error.message?.includes('Email not confirmed')) {
    return 'Por favor, confirme seu email antes de fazer login.';
  }
  
  if (error.message?.includes('JWT')) {
    return 'Sessão expirada. Por favor, faça login novamente.';
  }
  
  if (error.message?.includes('network')) {
    return 'Erro de conexão. Verifique sua internet.';
  }
  
  return error.message || 'Ocorreu um erro inesperado.';
};

// Add session recovery helper
export const recoverSession = async () => {
  try {
    console.log('Attempting to recover session...');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error recovering session:', error);
      // Clear any existing invalid session data
      await supabase.auth.signOut();
      localStorage.removeItem('olimpics_auth_token');
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
    // Clear any existing invalid session data
    await supabase.auth.signOut();
    localStorage.removeItem('olimpics_auth_token');
    return null;
  }
};

// Add initialization check
export const initializeSupabase = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      // Clear any potentially corrupted session data
      await supabase.auth.signOut();
      localStorage.removeItem('olimpics_auth_token');
    }
  } catch (error) {
    console.error('Error initializing Supabase:', error);
    await supabase.auth.signOut();
    localStorage.removeItem('olimpics_auth_token');
  }
};

// Initialize on import
initializeSupabase();

