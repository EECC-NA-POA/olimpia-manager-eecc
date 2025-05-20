
import { supabase } from '../supabase';

export const fetchActivePrivacyPolicy = async (): Promise<string> => {
  console.log('Fetching active privacy policy...');
  
  try {
    // Importante: usamos um cabeçalho anônimo para garantir acesso público
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
    // Retornar uma mensagem de erro mais amigável para o usuário
    return 'Não foi possível carregar a política de privacidade. Por favor, tente novamente mais tarde.';
  }
};
