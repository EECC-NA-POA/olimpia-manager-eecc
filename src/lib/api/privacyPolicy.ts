
import { supabase } from '../supabase';

export const fetchActivePrivacyPolicy = async (): Promise<string> => {
  console.log('Fetching active privacy policy...');
  
  try {
    // Using service role key via the supabase client configured in lib/supabase.ts
    const { data, error } = await supabase
      .from('termos_privacidade')
      .select('conteudo')
      .eq('ativo', true)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching privacy policy:', error);
      throw error;
    }
    
    if (!data) {
      console.warn('No active privacy policy found');
      return 'Política de privacidade não disponível no momento.';
    }
    
    return data.conteudo;
  } catch (error) {
    console.error('Exception in fetchActivePrivacyPolicy:', error);
    throw error;
  }
};
