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

// Create SINGLE Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'olimpics_auth_token',
    storage: localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Disable to prevent conflicts
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'olimpics-app-v2',
    }
  }
});

// Debug session state
const debugSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('🔍 Session Debug:', {
      hasSession: !!session,
      userId: session?.user?.id || 'null',
      email: session?.user?.email || 'none',
      expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'none',
      error: error?.message || 'none'
    });
    return session;
  } catch (error) {
    console.error('❌ Session debug error:', error);
    return null;
  }
};

// Enhanced error handling
export const handleSupabaseError = (error: any) => {
  console.error('🚨 Supabase error:', error);
  
  // Check for session-related errors
  const isSessionError = error.message?.includes('JWT') || 
                        error.message?.includes('refresh_token_not_found') || 
                        error.message?.includes('token') ||
                        error.message?.includes('CompactDecodeError') ||
                        error.message?.includes('invalid session') ||
                        error.message?.includes('invalid_grant');

  if (isSessionError) {
    console.log('⚠️ Session error detected, but NOT clearing session automatically');
    return 'Erro de sessão detectado. Tente fazer login novamente.';
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

// Session recovery with retry logic
export const recoverSession = async (maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Session recovery attempt ${attempt}/${maxRetries}`);
      const session = await debugSession();
      
      if (session) {
        console.log('✅ Session recovered successfully');
        return session;
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    } catch (error) {
      console.error(`❌ Recovery attempt ${attempt} failed:`, error);
    }
  }
  
  console.log('❌ Session recovery failed after all attempts');
  return null;
};

// Initialize and debug on startup
debugSession();
