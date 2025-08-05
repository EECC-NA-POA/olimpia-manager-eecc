
import { supabase } from '../supabase';

export const fetchActivePrivacyPolicy = async (): Promise<string> => {
  console.log('🔍 API - Fetching active privacy policy...');
  
  try {
    // Tentativa com o cliente padrão do Supabase para acessar dados públicos
    const { data, error } = await supabase
      .from('termos_privacidade')
      .select('termo_texto')
      .eq('ativo', true)
      .order('data_criacao', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('❌ API - Error fetching privacy policy:', error);
      
      // Se houver erro de permissão, vamos tentar uma abordagem alternativa
      if (error.code === 'PGRST301' || error.code === 'PGRST116') {
        console.log('Permission error, trying alternative approach...');
        
        // Tentativa usando acesso anônimo através da API pública
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sb.nova-acropole.org.br/';
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'x9Ll0f6bKmCBQWXGrBHtH4zPxEht0Of7XShBxUV8IkJPF8GKjXK4VKeTTt0bAMvbWcF7zUOZA02pdbLahz9Z4eFzhk6EVPwflciK5HasI7Cm7zokA4y3Sg8EG34qseUQZGTUiTjTAf9idr6mcdEEPdKSUvju6PwLJxLRjSF3oRRF6KTHrPyWpyY5rJs7m7QCFd1uMOSBQ7gY4RtTMydqWAgIHJJhxTPxC49A2rMuB0Z';
        
        const publicResponse = await fetch(`${supabaseUrl}/rest/v1/termos_privacidade?select=termo_texto&ativo=eq.true&order=data_criacao.desc&limit=1`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json'
          }
        });
        
        if (publicResponse.ok) {
          const publicData = await publicResponse.json();
          if (publicData && publicData.length > 0) {
            console.log('✅ API - Successfully fetched privacy policy through public API');
            return publicData[0].termo_texto || 'Política de privacidade carregada com sucesso.';
          }
        } else {
          console.warn('⚠️ API - Public API response not OK:', publicResponse.status, publicResponse.statusText);
        }
        
        return 'Para visualizar nossa política de privacidade completa, por favor entre em contato com o suporte.';
      }
      
      throw new Error(`Erro ao buscar política de privacidade: ${error.message}`);
    }
    
    if (!data) {
      console.warn('⚠️ API - No active privacy policy found');
      return 'Política de privacidade não disponível no momento.';
    }
    
    console.log('✅ API - Privacy policy fetched successfully');
    return data.termo_texto || 'Conteúdo da política de privacidade não disponível.';
  } catch (error: any) {
    console.error('💥 API - Exception in fetchActivePrivacyPolicy:', error);
    return 'Não foi possível carregar a política de privacidade. Por favor, tente novamente mais tarde.';
  }
};
