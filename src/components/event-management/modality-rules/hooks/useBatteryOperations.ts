
import { supabase } from '@/lib/supabase';
import { checkUserPermissions } from './utils/permissionUtils';

export function useBatteryOperations() {
  const createBaterias = async (modalityId: string, eventId: string, numBaterias: number) => {
    console.log(`Creating ${numBaterias} baterias for modality ${modalityId} in event ${eventId}`);
    
    try {
      // Check permissions
      await checkUserPermissions(eventId);
      
      // First, delete existing baterias for this modality to avoid duplicates
      console.log('Deleting existing baterias...');
      const { error: deleteError } = await supabase
        .from('baterias')
        .delete()
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId);
      
      if (deleteError) {
        console.error('Error deleting existing baterias:', deleteError);
        // Don't throw here, continue with creation
      }
      
      // Try using RPC function instead of direct insert
      console.log('Attempting to create baterias using RPC...');
      
      const { data: rpcResult, error: rpcError } = await supabase.rpc('criar_baterias_modalidade', {
        p_modalidade_id: parseInt(modalityId),
        p_evento_id: eventId,
        p_num_baterias: numBaterias
      });
      
      if (rpcError) {
        console.error('RPC function error:', rpcError);
        console.log('Falling back to direct insert...');
        
        // Fallback to direct insert
        const bateriasToInsert = Array.from({ length: numBaterias }, (_, index) => ({
          evento_id: eventId,
          modalidade_id: parseInt(modalityId),
          numero: index + 1,
          descricao: `Bateria ${index + 1}`
        }));
        
        console.log('Attempting to insert baterias directly:', bateriasToInsert);
        console.log('Bateria table structure check - modalidade_id type:', typeof bateriasToInsert[0].modalidade_id);
        console.log('Bateria table structure check - evento_id type:', typeof bateriasToInsert[0].evento_id);
        
        const { data, error } = await supabase
          .from('baterias')
          .insert(bateriasToInsert)
          .select();
        
        if (error) {
          console.error('Detailed error creating baterias:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          
          if (error.code === '42501') {
            throw new Error('Política RLS bloqueando inserção. Verifique as políticas da tabela baterias.');
          }
          
          if (error.code === '23503') {
            throw new Error('Erro de referência: modalidade ou evento não encontrado.');
          }
          
          if (error.code === '23505') {
            throw new Error('Bateria duplicada encontrada.');
          }
          
          throw new Error(`Erro ao criar baterias: ${error.message}`);
        }
        
        console.log(`Successfully created ${numBaterias} baterias via direct insert:`, data);
        return data;
      } else {
        console.log(`Successfully created ${numBaterias} baterias via RPC:`, rpcResult);
        return rpcResult;
      }
    } catch (error) {
      console.error('Error in createBaterias:', error);
      throw error;
    }
  };

  const deleteBaterias = async (modalityId: string, eventId: string) => {
    const { error: bateriaError } = await supabase
      .from('baterias')
      .delete()
      .eq('modalidade_id', modalityId)
      .eq('evento_id', eventId);
      
    if (bateriaError) {
      console.error('Error deleting baterias:', bateriaError);
      // Continue with rule deletion even if bateria deletion fails
    }
  };

  return {
    createBaterias,
    deleteBaterias
  };
}
