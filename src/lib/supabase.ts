
import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallback values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sb.nova-acropole.org.br/';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'x9Ll0f6bKmCBQWXGrBHtH4zPxEht0Of7XShBxUV8IkJPF8GKjXK4VKeTTt0bAMvbWcF7zUOZA02pdbLahz9Z4eFzhk6EVPwflciK5HasI7Cm7zokA4y3Sg8EG34qseUQZGTUiTjTAf9idr6mcdEEPdKSUvju6PwLJxLRjSF3oRRF6KTHrPyWpyY5rJs7m7QCFd1uMOSBQ7gY4RtTMydqWAgIHJJhxTPxC49A2rMuB0Z';

// Helper to check for invalid tokens in localStorage
const cleanupInvalidTokens = () => {
  try {
    const storageKey = 'olimpics_auth_token';
    const storedItem = localStorage.getItem(storageKey);
    
    if (!storedItem) return;
    
    // Try to parse the stored token
    try {
      const parsedToken = JSON.parse(storedItem);
      // Check if token has expected format
      if (!parsedToken || typeof parsedToken !== 'object' || !parsedToken.access_token) {
        console.log('Found invalid token format, removing:', storageKey);
        localStorage.removeItem(storageKey);
      }
    } catch (e) {
      // If we can't parse the token, it's invalid
      console.error('Invalid token format in localStorage, removing:', e);
      localStorage.removeItem(storageKey);
    }
  } catch (e) {
    console.error('Error checking localStorage tokens:', e);
  }
};

// Clean up any invalid tokens before creating the client
cleanupInvalidTokens();

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

// Add error handling helper with improved JWT error detection
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  // Check for JWT-related errors with broader pattern matching
  if (error.message?.includes('JWT') || 
      error.message?.includes('refresh_token_not_found') || 
      error.message?.includes('token') ||
      error.message?.includes('CompactDecodeError')) {
    
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
    // First clean up any invalid tokens
    cleanupInvalidTokens();
    
    // Try to get the session
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      // Sign out and clean up
      await supabase.auth.signOut();
      localStorage.removeItem('olimpics_auth_token');
    }
    
    return session;
  } catch (error) {
    console.error('Error initializing Supabase:', error);
    // Safe cleanup
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('olimpics_auth_token');
    } catch (e) {
      console.error('Error during cleanup:', e);
    }
    return null;
  }
};

// Call initialize on import
initializeSupabase();

// Add recovery helper for user session
export const recoverSession = async () => {
  try {
    console.log('Attempting to recover session...');
    const session = await initializeSupabase(); // Make sure we're starting clean
    
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
