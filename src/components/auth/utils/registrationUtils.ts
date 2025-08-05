
import { supabase } from '@/lib/supabase';

export const formatBirthDate = (date?: Date): string | null => {
  if (!date) return null;
  return date.toISOString().split('T')[0];
};

export const checkExistingUser = async (email: string) => {
  try {
    console.log('🔍 Checking existing user for email:', email);
    
    // For self-hosted instances, skip user existence check
    // Let the signup process handle duplicates
    console.log('📋 Skipping user existence check - will let signup handle duplicates');
    
    return { data: null, error: null };
  } catch (error) {
    console.error('Error in checkExistingUser:', error);
    return { data: null, error };
  }
};

export const prepareUserMetadata = (values: any, formattedBirthDate?: string | null) => {
  // Complete metadata structure aligned with database trigger expectations
  return {
    nome_completo: String(values.nome || '').trim(),
    telefone: String(values.telefone || '').trim(),
    ddi: String(values.ddi || '+55').trim(),
    tipo_documento: String(values.tipo_documento || 'CPF').trim(),
    numero_documento: String(values.numero_documento || '').trim(),
    genero: String(values.genero || 'Masculino').trim(),
    data_nascimento: formattedBirthDate || values.data_nascimento || '1990-01-01',
    estado: String(values.state || '').trim(),
    filial_id: String(values.branchId || '').trim()
  };
};
