import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallback values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sb.nova-acropole.org.br';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'x9Ll0f6bKmCBQWXGrBHtH4zPxEht0Of7XShBxUV8IkJPF8GKjXK4VKeTTt0bAMvbWcF7zUOZA02pdbLahz9Z4eFzhk6EVPwflciK5HasI7Cm7zokA4y3Sg8EG34qseUQZGTUiTjTAf9idr6mcdEEPdKSUvju6PwLJxLRjSF3oRRF6KTHrPyWpyY5rJs7m7QCFd1uMOSBQ7gY4RtTMydqWAgIHJJhxTPxC49A2rMuB0Z';

console.log('🔧 Supabase Configuration:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  anonKeyLength: supabaseAnonKey.length,
  timestamp: new Date().toISOString()
});

// Test connection function
const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabase.from('usuarios').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
};

// Create the Supabase client
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
      'X-Client-Info': 'lovable-app',
    }
  }
});

// Test connection on initialization
testSupabaseConnection();

// Add error handling helper with improved JWT error detection
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  // Check for JWT-related errors with broader pattern matching
  if (error.message?.includes('JWT') || 
      error.message?.includes('refresh_token_not_found') || 
      error.message?.includes('token') ||
      error.message?.includes('CompactDecodeError') ||
      error.message?.includes('invalid session')) {
    
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

export const initializeSupabase = async () => {
  try {
    console.log('🚀 Initializing Supabase...');
    
    // Test connection first
    const connectionOk = await testSupabaseConnection();
    if (!connectionOk) {
      console.warn('⚠️ Supabase connection issues detected');
    }
    
    // Try to get the session
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      await supabase.auth.signOut();
      localStorage.removeItem('olimpics_auth_token');
    }
    
    return session;
  } catch (error) {
    console.error('Error initializing Supabase:', error);
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('olimpics_auth_token');
    } catch (e) {
      console.error('Error during cleanup:', e);
    }
    return null;
  }
};

export const recoverSession = async () => {
  try {
    console.log('Attempting to recover session...');
    const session = await initializeSupabase();
    
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

// Call initialize on import
initializeSupabase();
