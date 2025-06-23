
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
  // Simplified metadata - only essential fields that we know work
  return {
    nome_completo: String(values.nome || '').trim(),
    telefone: String(values.telefone || '').trim(),
    estado: String(values.state || '').trim(),
    filial_id: String(values.branchId || '').trim()
  };
};
