
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sb.nova-acropole.org.br';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiLm5vdmEtYWNyb3BvbGUub3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTc0NzY4MDAsImV4cCI6MjAxMzA1MjgwMH0.xyz123';

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
