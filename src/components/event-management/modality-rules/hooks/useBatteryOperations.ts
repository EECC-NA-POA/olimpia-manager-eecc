
import { supabase } from '@/lib/supabase';
import { checkUserPermissions } from './utils/permissionUtils';

export function useBatteryOperations() {
  const createBaterias = async (modalityId: string, eventId: string, numBaterias: number) => {
    console.log(`Creating ${numBaterias} baterias for modality ${modalityId} in event ${eventId}`);
    
    try {
      // Check permissions first
      const { user } = await checkUserPermissions(eventId);
      console.log('User ID for bateria creation:', user?.id);
      
      // First, delete existing baterias for this modality to avoid duplicates
      console.log('Deleting existing baterias...');
      const { error: deleteError } = await supabase
        .from('baterias')
        .delete()
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId);
      
      if (deleteError) {
        console.error('Error deleting existing baterias:', deleteError);
        // Continue with creation even if deletion fails
      }
      
      // Try using RPC function first (should bypass RLS)
      console.log('Attempting to create baterias using RPC function...');
      
      const { data: rpcResult, error: rpcError } = await supabase.rpc('criar_baterias_modalidade', {
        p_modalidade_id: parseInt(modalityId),
        p_evento_id: eventId,
        p_num_baterias: numBaterias
      });
      
      if (rpcError) {
        console.error('RPC function error:', rpcError);
        
        // If RPC fails, try direct insert with proper user context
        console.log('RPC failed, attempting direct insert with user context...');
        
        const bateriasToInsert = Array.from({ length: numBaterias }, (_, index) => ({
          evento_id: eventId,
          modalidade_id: parseInt(modalityId),
          numero: index + 1,
          descricao: `Bateria ${index + 1}`,
          criado_por: user?.id, // Add user context for RLS
        }));
        
        console.log('Inserting baterias with user context:', bateriasToInsert);
        
        const { data, error } = await supabase
          .from('baterias')
          .insert(bateriasToInsert)
          .select();
        
        if (error) {
          console.error('Detailed error creating baterias:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            user_id: user?.id
          });
          
          if (error.code === '42501') {
            throw new Error(`Política RLS bloqueando inserção na tabela baterias. Usuário: ${user?.id}. Verifique se o usuário tem permissões adequadas no evento ${eventId}.`);
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
    try {
      // Check permissions before deletion
      await checkUserPermissions(eventId);
      
      const { error: bateriaError } = await supabase
        .from('baterias')
        .delete()
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId);
        
      if (bateriaError) {
        console.error('Error deleting baterias:', bateriaError);
        throw new Error(`Erro ao deletar baterias: ${bateriaError.message}`);
      }
      
      console.log(`Successfully deleted baterias for modality ${modalityId}`);
    } catch (error) {
      console.error('Error in deleteBaterias:', error);
      // Don't throw here, just log the error for rule deletion to continue
    }
  };

  return {
    createBaterias,
    deleteBaterias
  };
}
