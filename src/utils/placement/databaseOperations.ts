
import { supabase } from '@/lib/supabase';

interface SavePlacementParams {
  athleteId: string;
  fieldKey: string;
  placement: number;
  modalityId: number;
  eventId: string;
  judgeId: string;
  modeloId: number;
  bateriaId?: number;
}

export async function saveCalculatedPlacement({
  athleteId,
  fieldKey,
  placement,
  modalityId,
  eventId,
  judgeId,
  modeloId,
  bateriaId
}: SavePlacementParams): Promise<void> {
  console.log(`Salvando colocação para atleta ${athleteId}: ${fieldKey} = ${placement}`);
  
  // Buscar pontuação existente
  let query = supabase
    .from('pontuacoes')
    .select('id')
    .eq('atleta_id', athleteId)
    .eq('modalidade_id', modalityId)
    .eq('evento_id', eventId)
    .eq('modelo_id', modeloId)
    .eq('juiz_id', judgeId);

  if (bateriaId) {
    query = query.eq('numero_bateria', bateriaId);
  } else {
    query = query.is('numero_bateria', null);
  }

  const { data: existingScore, error: scoreError } = await query.single();

  if (scoreError && scoreError.code !== 'PGRST116') {
    throw scoreError;
  }

  let pontuacaoId: number;

  if (existingScore) {
    pontuacaoId = existingScore.id;
  } else {
    // Criar nova pontuação se não existir
    const { data: newScore, error: newScoreError } = await supabase
      .from('pontuacoes')
      .insert({
        atleta_id: athleteId,
        modalidade_id: modalityId,
        evento_id: eventId,
        modelo_id: modeloId,
        juiz_id: judgeId,
        numero_bateria: bateriaId || null
      })
      .select('id')
      .single();

    if (newScoreError) throw newScoreError;
    pontuacaoId = newScore.id;
  }

  // Salvar/atualizar tentativa calculada
  const { error: tentativaError } = await supabase
    .from('tentativas_pontuacao')
    .upsert({
      pontuacao_id: pontuacaoId,
      chave_campo: fieldKey,
      valor: placement,
      valor_formatado: placement.toString()
    });

  if (tentativaError) throw tentativaError;
}
