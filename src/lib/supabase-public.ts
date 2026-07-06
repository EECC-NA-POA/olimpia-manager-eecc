
import { createClient } from '@supabase/supabase-js';
import { requireSupabaseEnv } from './requireSupabaseEnv';

const { url: supabaseUrl, anonKey: supabaseAnonKey } = requireSupabaseEnv(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Public client without persisted/loaded session to avoid sending Authorization header
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'olimpics-app-v2',
    },
  },
});
