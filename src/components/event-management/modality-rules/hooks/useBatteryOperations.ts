
import { supabase } from '@/lib/supabase';
import { checkUserPermissions } from './utils/permissionUtils';

export function useBatteryOperations() {
  const createBaterias = async (modalityId: string, eventId: string, numBaterias: number) => {
    console.log(`Creating ${numBaterias} baterias for modality ${modalityId} in event ${eventId}`);
    
    // Check permissions first and get user outside try block
    const { user } = await checkUserPermissions(eventId);
    console.log('User ID for bateria creation:', user?.id);
    
    try {
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
      
      // Create baterias directly without RPC function since it has column issues
      console.log('Creating baterias directly...');
      
      const bateriasToInsert = [];
      for (let i = 1; i <= numBaterias; i++) {
        bateriasToInsert.push({
          modalidade_id: parseInt(modalityId),
          evento_id: eventId,
          numero: i
        });
      }
      
      const { data: insertedBaterias, error: insertError } = await supabase
        .from('baterias')
        .insert(bateriasToInsert)
        .select();
      
      if (insertError) {
        console.error('Error inserting baterias:', insertError);
        throw new Error(`Erro ao criar baterias: ${insertError.message}`);
      }
      
      console.log(`Successfully created ${numBaterias} baterias:`, insertedBaterias);
      return insertedBaterias;
      
    } catch (error) {
      console.error('Error in createBaterias:', error);
      
      // Provide more specific error messages for common RLS issues
      if (error instanceof Error) {
        if (error.message.includes('RLS') || error.message.includes('policy') || error.message.includes('42501')) {
          throw new Error(`Política RLS bloqueando inserção na tabela baterias. Usuário: ${user?.id}. Verifique se existem políticas adequadas para criação de baterias no evento ${eventId}. Detalhes: ${error.message}`);
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
