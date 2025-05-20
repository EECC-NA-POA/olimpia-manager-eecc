
import { supabase } from '../supabase';

export const fetchActivePrivacyPolicy = async (): Promise<string> => {
  console.log('Fetching active privacy policy...');
  
  try {
    // Primeiro, tentamos buscar do Supabase
    const { data, error } = await supabase
      .from('termos_privacidade')
      .select('conteudo')
      .eq('ativo', true)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching privacy policy:', error);
      
      // Se erro for relacionado à autenticação, tente uma abordagem alternativa
      if (error.code === 'PGRST301') {
        console.log('Authentication error detected, using fallback content');
        return getFallbackPrivacyPolicy();
      }
      
      throw error;
    }
    
    if (!data) {
      console.warn('No active privacy policy found');
      return getFallbackPrivacyPolicy();
    }
    
    return data.conteudo;
  } catch (error) {
    console.error('Exception in fetchActivePrivacyPolicy:', error);
    return getFallbackPrivacyPolicy();
  }
};

// Conteúdo de fallback para quando não conseguirmos acessar o banco
const getFallbackPrivacyPolicy = (): string => {
  return `
    <h1>Política de Privacidade</h1>
    
    <h2>Última atualização: Maio de 2025</h2>
    
    <p>A Escola do Esporte com Coração e a Nova Acrópole estão comprometidas com a proteção da sua privacidade. 
    Esta política de privacidade descreve como coletamos, usamos e protegemos suas informações pessoais.</p>
    
    <h3>1. Informações que coletamos</h3>
    <p>Coletamos informações necessárias para viabilizar sua participação nos eventos olímpicos, 
    incluindo nome completo, documentos de identificação, data de nascimento, gênero, informações de contato, 
    e dados relacionados às modalidades esportivas de seu interesse.</p>
    
    <h3>2. Como utilizamos suas informações</h3>
    <p>Utilizamos suas informações para gerenciar sua inscrição nos eventos, comunicar informações relevantes sobre as competições, 
    emitir certificados de participação, e manter registros estatísticos.</p>
    
    <h3>3. Compartilhamento de dados</h3>
    <p>Seus dados podem ser compartilhados entre as organizações responsáveis pelos eventos (Escola do Esporte com Coração e Nova Acrópole), 
    mas não serão vendidos ou compartilhados com terceiros sem sua autorização.</p>
    
    <h3>4. Seus direitos</h3>
    <p>Você tem o direito de acessar, corrigir ou solicitar a exclusão de seus dados pessoais a qualquer momento, 
    conforme previsto na Lei Geral de Proteção de Dados (LGPD).</p>
    
    <h3>5. Contato</h3>
    <p>Para questões relacionadas à privacidade de seus dados, entre em contato através do email: privacidade@esportecoracao.org</p>
  `;
};
