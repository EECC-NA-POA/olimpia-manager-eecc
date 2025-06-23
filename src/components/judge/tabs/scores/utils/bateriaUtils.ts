
import { supabase } from '@/lib/supabase';

export async function ensureBateriaExists(modalityId: number, eventId: string): Promise<number> {
  console.log('Ensuring bateria exists for modality:', modalityId, 'event:', eventId);
  
  // Check if baterias table exists and has data for this modality
  const { data: existingBaterias, error: fetchError } = await supabase
    .from('baterias')
    .select('id')
    .eq('modalidade_id', modalityId)
    .eq('evento_id', eventId)
    .limit(1);

  if (fetchError) {
    console.error('Error checking baterias:', fetchError);
    throw new Error('Erro ao verificar baterias');
  }

  if (existingBaterias && existingBaterias.length > 0) {
    console.log('Found existing bateria:', existingBaterias[0].id);
    return existingBaterias[0].id;
  }

  // Create default bateria if none exists
  console.log('Creating default bateria for modality:', modalityId);
  const { data: newBateria, error: createError } = await supabase
    .from('baterias')
    .insert({
      modalidade_id: modalityId,
      evento_id: eventId,
      numero: 1
    })
    .select('id')
    .single();

  if (createError || !newBateria) {
    console.error('Error creating bateria:', createError);
    throw new Error('Erro ao criar bateria: ' + (createError?.message || 'Erro desconhecido'));
  }

  console.log('Created new bateria:', newBateria.id);
  return newBateria.id;
}

export async function createBateriaIfNotExists(modalityId: number, eventId: string): Promise<void> {
  try {
    await ensureBateriaExists(modalityId, eventId);
  } catch (error) {
    console.error('Failed to ensure bateria exists:', error);
    // Don't throw - let the scoring system handle this gracefully
  }
}
