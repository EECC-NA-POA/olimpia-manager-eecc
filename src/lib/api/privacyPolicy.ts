
import { supabase } from '../supabase';

export const fetchActivePrivacyPolicy = async (): Promise<string> => {
  console.log('Fetching active privacy policy...');
  
  try {
    // Create a specific query for the public privacy policy that doesn't rely on authentication
    const { data, error } = await supabase
      .from('termos_privacidade')
      .select('conteudo')
      .eq('ativo', true)
      .order('created_at', { ascending: false }) // Get the most recent
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error fetching privacy policy:', error);
      throw error;
    }
    
    if (!data) {
      console.warn('No active privacy policy found');
      return 'Política de privacidade não disponível no momento.';
    }
    
    console.log('Privacy policy fetched successfully');
    return data.conteudo;
  } catch (error) {
    console.error('Exception in fetchActivePrivacyPolicy:', error);
    throw error;
  }
};
