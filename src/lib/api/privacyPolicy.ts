
import { supabase } from '../supabase';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';

export const fetchActivePrivacyPolicy = async (): Promise<string> => {
  console.log('Fetching active privacy policy...');
  
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
      console.error('Error fetching privacy policy:', error);
      
      // Se houver erro de permissão, vamos tentar uma abordagem alternativa
      if (error.code === 'PGRST301' || error.code === 'PGRST116') {
        console.log('Permission error, trying alternative approach...');
        
        // Tentativa usando acesso anônimo através da API pública
        const publicResponse = await fetch(`${SUPABASE_URL}/rest/v1/termos_privacidade?select=termo_texto&ativo=eq.true&order=data_criacao.desc&limit=1`, {
          headers: {
            'apikey': SUPABASE_PUBLISHABLE_KEY,
            'Content-Type': 'application/json'
          }
        });
        
        if (publicResponse.ok) {
          const publicData = await publicResponse.json();
          if (publicData && publicData.length > 0) {
            console.log('Successfully fetched privacy policy through public API');
            return publicData[0].termo_texto || 'Política de privacidade carregada com sucesso.';
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
    return data.termo_texto || 'Conteúdo da política de privacidade não disponível.';
  } catch (error: any) {
    console.error('Exception in fetchActivePrivacyPolicy:', error);
    return 'Não foi possível carregar a política de privacidade. Por favor, tente novamente mais tarde.';
  }
};

// Helper function to create the privacy policy acceptance RPC if it doesn't exist
export const createPrivacyAcceptanceRPC = async () => {
  try {
    console.log('Setting up privacy policy acceptance RPC...');
    
    // Criar função RPC para registro de aceite de política de privacidade
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION register_privacy_acceptance(
        p_user_id UUID, 
        p_version TEXT, 
        p_policy_id UUID,
        p_policy_text TEXT
      )
      RETURNS BOOLEAN AS $$
      BEGIN
        INSERT INTO logs_aceite_privacidade (
          usuario_id, 
          versao_termo, 
          termo_privacidade_id, 
          termo_texto
        )
        VALUES (
          p_user_id, 
          p_version, 
          p_policy_id, 
          p_policy_text
        );
        RETURN TRUE;
      EXCEPTION WHEN OTHERS THEN
        RAISE;
        RETURN FALSE;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    const { error: createError } = await supabase.rpc('execute_sql', {
      sql: createFunctionSQL
    });
    
    if (createError) {
      console.error('Could not create privacy acceptance RPC:', createError);
    } else {
      console.log('Created privacy acceptance RPC successfully');
    }
  } catch (error) {
    console.error('Error setting up privacy acceptance RPC:', error);
  }
};

// Try to set up the RPC when the application starts
createPrivacyAcceptanceRPC().catch(console.error);
