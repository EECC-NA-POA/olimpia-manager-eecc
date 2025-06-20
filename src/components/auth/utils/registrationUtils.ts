
import { supabase } from '@/lib/supabase';

export const formatBirthDate = (date?: Date): string | null => {
  if (!date) return null;
  return date.toISOString().split('T')[0];
};

export const checkExistingUser = async (email: string) => {
  try {
    console.log('🔍 Checking existing user for email:', email);
    
    // Use auth admin methods instead of direct table query to avoid JWT issues
    // For now, we'll rely on the signup process to handle duplicate emails
    // This is safer than trying to query the users table directly
    console.log('📋 Skipping user existence check - will let signup handle duplicates');
    
    return { data: null, error: null };
  } catch (error) {
    console.error('Error in checkExistingUser:', error);
    return { data: null, error };
  }
};

export const prepareUserMetadata = (values: any, formattedBirthDate: string) => {
  // Map form fields to the correct database field names
  return {
    nome_completo: String(values.nome || '').trim(),
    telefone: String(values.telefone || '').trim(),
    ddi: String(values.ddi || '+55').trim(),
    tipo_documento: String(values.tipo_documento || 'CPF').trim(),
    numero_documento: String(values.numero_documento || '').trim(),
    genero: String(values.genero || '').trim(),
    data_nascimento: formattedBirthDate,
    estado: String(values.state || '').trim(),
    filial_id: String(values.branchId || '').trim()
  };
};
