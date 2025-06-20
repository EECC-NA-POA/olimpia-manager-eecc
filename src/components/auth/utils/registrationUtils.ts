
import { supabase } from '@/integrations/supabase/client';

export const formatBirthDate = (date?: Date): string | null => {
  if (!date) return null;
  return date.toISOString().split('T')[0];
};

export const checkExistingUser = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error in checkExistingUser:', error);
    return { data: null, error };
  }
};

export const prepareUserMetadata = (values: any, formattedBirthDate: string) => {
  return {
    nome: values.nome,
    telefone: values.telefone,
    ddi: values.ddi,
    tipo_documento: values.tipo_documento,
    numero_documento: values.numero_documento,
    genero: values.genero,
    data_nascimento: formattedBirthDate,
    estado: values.state,
    filial_id: values.branchId
  };
};
