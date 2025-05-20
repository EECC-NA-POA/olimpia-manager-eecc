
import { supabase } from '../supabase';

export const fetchActivePrivacyPolicy = async (): Promise<string> => {
  console.log('Fetching active privacy policy...');
  
  try {
    // Usamos .from() sem qualquer cabeçalho de autenticação para acesso público
    const { data, error } = await supabase
      .from('termos_privacidade')
      .select('conteudo')
      .eq('ativo', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error fetching privacy policy:', error);
      throw new Error(`Erro ao buscar política de privacidade: ${error.message}`);
    }
    
    if (!data) {
      console.warn('No active privacy policy found');
      return 'Política de privacidade não disponível no momento.';
    }
    
    console.log('Privacy policy fetched successfully');
    return data.conteudo;
  } catch (error: any) {
    console.error('Exception in fetchActivePrivacyPolicy:', error);
    // Retornar uma mensagem de erro mais amigável para o usuário
    return 'Não foi possível carregar a política de privacidade. Por favor, tente novamente mais tarde.';
  }
};
