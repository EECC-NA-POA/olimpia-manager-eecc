
import { supabase } from '../supabase';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';

export const fetchActivePrivacyPolicy = async (): Promise<string> => {
  console.log('Fetching active privacy policy...');
  
  try {
    // Tentativa com o cliente padrão do Supabase para acessar dados públicos
    const { data, error } = await supabase
      .from('termos_privacidade')
      .select('conteudo')
      .eq('ativo', true)
      .order('data_criacao', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error fetching privacy policy:', error);
      
      // Se houver erro de permissão, vamos tentar uma abordagem alternativa
      if (error.code === 'PGRST301' || error.code === 'PGRST116') {
        console.log('Permission error, trying alternative approach...');
        
        // Tentativa usando acesso anônimo através da API pública
        const publicResponse = await fetch(`${SUPABASE_URL}/rest/v1/termos_privacidade?select=conteudo&ativo=eq.true&order=data_criacao.desc&limit=1`, {
          headers: {
            'apikey': SUPABASE_PUBLISHABLE_KEY,
            'Content-Type': 'application/json'
          }
        });
        
        if (publicResponse.ok) {
          const publicData = await publicResponse.json();
          if (publicData && publicData.length > 0) {
            console.log('Successfully fetched privacy policy through public API');
            return publicData[0].conteudo || 'Política de privacidade carregada com sucesso.';
          }
        }
        
        return 'Para visualizar nossa política de privacidade completa, por favor entre em contato com o suporte.';
      }
      
      throw new Error(`Erro ao buscar política de privacidade: ${error.message}`);
    }
    
    if (!data) {
      console.warn('No active privacy policy found');
      return 'Política de privacidade não disponível no momento.';
    }
    
    console.log('Privacy policy fetched successfully');
    return data.conteudo || 'Conteúdo da política de privacidade não disponível.';
  } catch (error: any) {
    console.error('Exception in fetchActivePrivacyPolicy:', error);
    return 'Não foi possível carregar a política de privacidade. Por favor, tente novamente mais tarde.';
  }
};
