
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
  
  // Buscar pontuação existente - corrigir a query para null values
  let query = supabase
    .from('pontuacoes')
    .select('id')
    .eq('atleta_id', athleteId)
    .eq('modalidade_id', modalityId)
    .eq('evento_id', eventId)
    .eq('modelo_id', modeloId)
    .eq('juiz_id', judgeId);

  // Corrigir o tratamento de numero_bateria null
  if (bateriaId) {
    query = query.eq('numero_bateria', bateriaId);
  } else {
    query = query.is('numero_bateria', null);
  }

  const { data: existingScore, error: scoreError } = await query.single();

  if (scoreError && scoreError.code !== 'PGRST116') {
    console.error('Erro ao buscar pontuação existente:', scoreError);
    throw scoreError;
  }

  let pontuacaoId: number;

  if (existingScore) {
    pontuacaoId = existingScore.id;
    console.log(`Pontuação existente encontrada: ${pontuacaoId}`);
  } else {
    // Criar nova pontuação se não existir
    console.log('Criando nova pontuação...');
    const { data: newScore, error: newScoreError } = await supabase
      .from('pontuacoes')
      .insert({
        atleta_id: athleteId,
        modalidade_id: modalityId,
        evento_id: eventId,
        modelo_id: modeloId,
        juiz_id: judgeId,
        numero_bateria: bateriaId || null,
        valor_pontuacao: 0, // Valor padrão para campos calculados
        unidade: 'calculado'
      })
      .select('id')
      .single();

    if (newScoreError) {
      console.error('Erro ao criar nova pontuação:', newScoreError);
      throw newScoreError;
    }
    pontuacaoId = newScore.id;
    console.log(`Nova pontuação criada: ${pontuacaoId}`);
  }

  // Salvar/atualizar tentativa calculada usando upsert para evitar duplicatas
  console.log(`Salvando tentativa: pontuacao_id=${pontuacaoId}, chave_campo=${fieldKey}, valor=${placement}`);
  
  const { error: tentativaError } = await supabase
    .from('tentativas_pontuacao')
    .upsert({
      pontuacao_id: pontuacaoId,
      chave_campo: fieldKey,
      valor: placement,
      valor_formatado: placement.toString()
    }, {
      onConflict: 'pontuacao_id,chave_campo'
    });

  if (tentativaError) {
    console.error('Erro ao salvar tentativa:', tentativaError);
    throw tentativaError;
  }
  
  console.log(`Colocação salva com sucesso: ${fieldKey} = ${placement}`);
}
