
import { ScoreRecord } from '../types';

export function getInitialValues(existingScore: ScoreRecord | null, modalityRule: any) {
  if (!existingScore || !modalityRule) return null;
  
  const dados = existingScore.dados_json as any;
  console.log('getInitialValues - existingScore dados_json:', dados);
  
  switch (modalityRule.regra_tipo) {
    case 'tempo':
      return {
        minutes: existingScore.tempo_minutos || 0,
        seconds: existingScore.tempo_segundos || 0,
        milliseconds: existingScore.tempo_milissegundos || 0,
        notes: existingScore.observacoes || ''
      };
      
    case 'distancia':
      if (dados?.meters !== undefined && dados?.centimeters !== undefined) {
        let initialData: any = {
          meters: dados.meters,
          centimeters: dados.centimeters,
          notes: existingScore.observacoes || ''
        };
        
        // Add heat and lane data if present
        if (dados.heat !== undefined) {
          initialData.heat = dados.heat;
        }
        if (dados.lane !== undefined) {
          initialData.lane = dados.lane;
        }
        
        return initialData;
      }
      return {
        score: existingScore.valor_pontuacao || 0,
        notes: existingScore.observacoes || ''
      };
      
    case 'baterias':
      return {
        tentativas: dados?.tentativas || Array.from({ length: modalityRule.parametros?.num_tentativas || 3 }, () => ({ valor: 0, raia: '' })),
        notes: existingScore.observacoes || ''
      };
      
    case 'sets':
      const melhorDe = modalityRule.parametros?.melhor_de || modalityRule.parametros?.num_sets || 3;
      const pontuaPorSet = modalityRule.parametros?.pontua_por_set !== false;
      const isVolleyball = modalityRule.parametros?.pontos_por_set !== undefined;
      
      if (pontuaPorSet) {
        return {
          sets: dados?.sets || Array.from({ length: melhorDe }, () => ({ pontos: 0 })),
          notes: existingScore.observacoes || ''
        };
      } else if (isVolleyball) {
        return {
          sets: dados?.sets || Array.from({ length: melhorDe }, () => ({ 
            vencedor: undefined, 
            pontosEquipe1: 0, 
            pontosEquipe2: 0 
          })),
          notes: existingScore.observacoes || ''
        };
      } else {
        return {
          sets: dados?.sets || Array.from({ length: melhorDe }, () => ({ vencedor: undefined })),
          notes: existingScore.observacoes || ''
        };
      }
      
    case 'arrows':
      const faseClassificacao = modalityRule.parametros?.fase_classificacao || false;
      const faseEliminacao = modalityRule.parametros?.fase_eliminacao || false;
      
      if (faseClassificacao || faseEliminacao) {
        let initialData: any = { notes: existingScore.observacoes || '' };
        
        if (faseClassificacao && dados?.classificationArrows) {
          initialData.classificationArrows = dados.classificationArrows;
        }
        
        if (faseEliminacao && dados?.eliminationSets) {
          initialData.eliminationSets = dados.eliminationSets;
          initialData.totalMatchPoints = dados.totalMatchPoints || 0;
          initialData.combatFinished = dados.combatFinished || false;
          initialData.needsShootOff = dados.needsShootOff || false;
          
          if (dados.shootOffScore !== undefined) {
            initialData.shootOffScore = dados.shootOffScore;
          }
        }
        
        return initialData;
      } else {
        return {
          flechas: dados?.flechas || Array.from({ length: modalityRule.parametros?.num_flechas || 6 }, () => ({ zona: '0' })),
          notes: existingScore.observacoes || ''
        };
      }
      
    default:
      return {
        score: existingScore.valor_pontuacao || 0,
        notes: existingScore.observacoes || ''
      };
  }
}
