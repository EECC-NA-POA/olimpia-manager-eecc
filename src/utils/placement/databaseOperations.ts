
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
  
  // Preparar dados da pontuação usando a constraint única
  const pontuacaoData = {
    evento_id: eventId,
    modalidade_id: modalityId,
    atleta_id: athleteId,
    juiz_id: judgeId,
    modelo_id: modeloId,
    numero_bateria: bateriaId || null,
    valor_pontuacao: 0, // Valor padrão para campos calculados
    unidade: 'calculado',
    data_registro: new Date().toISOString()
  };

  console.log('Dados da pontuação para upsert:', pontuacaoData);

  // Usar upsert para a pontuação para evitar duplicatas
  const { data: pontuacao, error: pontuacaoError } = await supabase
    .from('pontuacoes')
    .upsert(pontuacaoData, {
      onConflict: 'atleta_id,modalidade_id,evento_id,juiz_id,modelo_id,numero_bateria',
      ignoreDuplicates: false
    })
    .select('id')
    .single();

  if (pontuacaoError) {
    console.error('Erro ao fazer upsert da pontuação:', pontuacaoError);
    throw pontuacaoError;
  }

  console.log(`Pontuação upserted com ID: ${pontuacao.id}`);

  // Usar upsert para a tentativa calculada também
  console.log(`Fazendo upsert da tentativa: pontuacao_id=${pontuacao.id}, chave_campo=${fieldKey}, valor=${placement}`);
  
  const { error: tentativaError } = await supabase
    .from('tentativas_pontuacao')
    .upsert({
      pontuacao_id: pontuacao.id,
      chave_campo: fieldKey,
      valor: placement,
      valor_formatado: placement.toString()
    }, {
      onConflict: 'pontuacao_id,chave_campo',
      ignoreDuplicates: false
    });

  if (tentativaError) {
    console.error('Erro ao fazer upsert da tentativa:', tentativaError);
    throw tentativaError;
  }
  
  console.log(`Colocação salva com sucesso: ${fieldKey} = ${placement}`);
}
