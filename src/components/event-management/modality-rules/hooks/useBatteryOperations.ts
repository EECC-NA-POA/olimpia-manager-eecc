
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
      
      // Use RPC function (should bypass RLS with elevated privileges)
      console.log('Creating baterias using RPC function...');
      
      const { data: rpcResult, error: rpcError } = await supabase.rpc('criar_baterias_modalidade', {
        p_modalidade_id: parseInt(modalityId),
        p_evento_id: eventId,
        p_num_baterias: numBaterias
      });
      
      if (rpcError) {
        console.error('RPC function failed:', rpcError);
        throw new Error(`Erro na função RPC para criar baterias: ${rpcError.message}. Verifique se a função 'criar_baterias_modalidade' existe no banco de dados.`);
      }
      
      console.log(`Successfully created ${numBaterias} baterias via RPC:`, rpcResult);
      return rpcResult;
      
    } catch (error) {
      console.error('Error in createBaterias:', error);
      
      // Provide more specific error messages for common RLS issues
      if (error instanceof Error) {
        if (error.message.includes('RLS') || error.message.includes('policy') || error.message.includes('42501')) {
          throw new Error(`Política RLS bloqueando inserção na tabela baterias. Usuário: ${user?.id}. Verifique se existem políticas adequadas para criação de baterias no evento ${eventId}. Detalhes: ${error.message}`);
        }
        
        if (error.message.includes('function') && error.message.includes('does not exist')) {
          throw new Error('A função RPC "criar_baterias_modalidade" não existe no banco de dados. Verifique se ela foi criada corretamente.');
        }
      }
      
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
