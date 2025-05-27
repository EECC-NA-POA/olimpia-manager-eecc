
import { ModalityRule } from '../../../tabs/scores/hooks/useModalityRules';

interface AthleteData {
  atleta_id: string;
  equipe_id?: number;
}

export function prepareScoreData(
  formData: any,
  modalityRule: any,
  scoreType: 'tempo' | 'distancia' | 'pontos'
) {
  console.log('Form data received:', formData);
  console.log('Modality rule:', modalityRule);
  console.log('Score type:', scoreType);
  
  const rule = modalityRule;
  let scoreData: any = {};
  
  // Handle "baterias" rule type with specific units
  if (rule?.regra_tipo === 'baterias') {
    const parametros = rule.parametros || {};
    const unidade = parametros.unidade || 'pontos';
    
    console.log('Processing baterias rule with unit:', unidade);
    console.log('Score type from modality:', scoreType);
    
    // For baterias rule with tempo unit, or when scoreType is tempo
    if (unidade === 'tempo' || scoreType === 'tempo') {
      // Check for new format first (tentativa_X_minutes, etc.)
      const tentativaKeys = Object.keys(formData).filter(key => key.startsWith('tentativa_') && key.includes('_minutes'));
      
      if (tentativaKeys.length > 0) {
        // Process the first tentativa found (old format)
        const tentativaNumber = tentativaKeys[0].split('_')[1];
        const minutes = Number(formData[`tentativa_${tentativaNumber}_minutes`]) || 0;
        const seconds = Number(formData[`tentativa_${tentativaNumber}_seconds`]) || 0;
        const milliseconds = Number(formData[`tentativa_${tentativaNumber}_milliseconds`]) || 0;
        const raia = formData[`tentativa_${tentativaNumber}_raia`];
        
        console.log('Processing tentativa (old format):', { tentativaNumber, minutes, seconds, milliseconds, raia });
        
        // Convert to total seconds (more precise for database storage)
        const totalSeconds = (minutes * 60) + seconds + (milliseconds / 1000);
        
        scoreData = {
          valor_pontuacao: totalSeconds,
          unidade: 'segundos',
          tempo_minutos: minutes,
          tempo_segundos: seconds,
          tempo_milissegundos: milliseconds
        };
        
        if (raia) {
          scoreData.raia = parseInt(raia);
        }
      } else {
        // Handle new format from BateriasScoreFields
        console.log('Checking for new format with individual time fields...');
        
        // Look for individual time fields in root level
        if ('tentativa_1_minutes' in formData || 'tentativa_1_seconds' in formData || 'tentativa_1_milliseconds' in formData) {
          const minutes = Number(formData.tentativa_1_minutes) || 0;
          const seconds = Number(formData.tentativa_1_seconds) || 0;
          const milliseconds = Number(formData.tentativa_1_milliseconds) || 0;
          const raia = formData.tentativa_1_raia;
          
          console.log('Processing tentativa (new individual fields):', { minutes, seconds, milliseconds, raia });
          
          // Convert to total seconds (more precise for database storage)
          const totalSeconds = (minutes * 60) + seconds + (milliseconds / 1000);
          
          scoreData = {
            valor_pontuacao: totalSeconds,
            unidade: 'segundos',
            tempo_minutos: minutes,
            tempo_segundos: seconds,
            tempo_milissegundos: milliseconds
          };
          
          if (raia) {
            scoreData.raia = parseInt(raia);
          }
        } else {
          // Handle standard time input for tempo scoreType
          if ('minutes' in formData) {
            const minutes = Number(formData.minutes) || 0;
            const seconds = Number(formData.seconds) || 0;
            const milliseconds = Number(formData.milliseconds) || 0;
            
            // Convert to total seconds (more precise for database storage)
            const totalSeconds = (minutes * 60) + seconds + (milliseconds / 1000);
            
            scoreData = {
              valor_pontuacao: totalSeconds,
              unidade: 'segundos',
              tempo_minutos: minutes,
              tempo_segundos: seconds,
              tempo_milissegundos: milliseconds
            };
            
            if (formData.heat) {
              scoreData.bateria_id = formData.heat;
            }
            
            if (formData.lane) {
              scoreData.raia = formData.lane;
            }
          } else {
            // If no valid time data found, ensure we still have a valid valor_pontuacao
            console.log('No time data found, using default values');
            scoreData = {
              valor_pontuacao: 0, // Default to 0 seconds instead of null
              unidade: 'segundos',
              tempo_minutos: 0,
              tempo_segundos: 0,
              tempo_milissegundos: 0
            };
          }
        }
      }
    } else if (unidade === 'distancia') {
      // Handle distance scoring for baterias
      const tentativaKeys = Object.keys(formData).filter(key => key.startsWith('tentativa_') && key.includes('_meters'));
      
      if (tentativaKeys.length > 0) {
        const tentativaNumber = tentativaKeys[0].split('_')[1];
        const meters = Number(formData[`tentativa_${tentativaNumber}_meters`]) || 0;
        const centimeters = Number(formData[`tentativa_${tentativaNumber}_centimeters`]) || 0;
        const raia = formData[`tentativa_${tentativaNumber}_raia`];
        
        const totalMeters = meters + (centimeters / 100);
        
        scoreData = {
          valor_pontuacao: totalMeters,
          unidade: 'm'
        };
        
        if (raia) {
          scoreData.raia = parseInt(raia);
        }
      } else {
        // Handle new format from BateriasScoreFields
        if ('tentativa_1_meters' in formData || 'tentativa_1_centimeters' in formData) {
          const meters = Number(formData.tentativa_1_meters) || 0;
          const centimeters = Number(formData.tentativa_1_centimeters) || 0;
          const raia = formData.tentativa_1_raia;
          
          const totalMeters = meters + (centimeters / 100);
          
          scoreData = {
            valor_pontuacao: totalMeters,
            unidade: 'm'
          };
          
          if (raia) {
            scoreData.raia = parseInt(raia);
          }
        } else {
          scoreData = {
            valor_pontuacao: 0,
            unidade: 'm'
          };
        }
      }
    } else {
      // Handle points or other units for baterias
      const tentativaKeys = Object.keys(formData).filter(key => key.startsWith('tentativa_') && key.includes('_score'));
      
      if (tentativaKeys.length > 0) {
        const tentativaNumber = tentativaKeys[0].split('_')[1];
        const score = Number(formData[`tentativa_${tentativaNumber}_score`]) || 0;
        const raia = formData[`tentativa_${tentativaNumber}_raia`];
        
        scoreData = {
          valor_pontuacao: score,
          unidade: unidade
        };
        
        if (raia) {
          scoreData.raia = parseInt(raia);
        }
      } else {
        // Handle new format from BateriasScoreFields
        if ('tentativa_1_score' in formData) {
          const score = Number(formData.tentativa_1_score) || 0;
          const raia = formData.tentativa_1_raia;
          
          scoreData = {
            valor_pontuacao: score,
            unidade: unidade
          };
          
          if (raia) {
            scoreData.raia = parseInt(raia);
          }
        } else {
          scoreData = {
            valor_pontuacao: 0,
            unidade: unidade
          };
        }
      }
    }
  } else if (rule?.regra_tipo === 'distancia' || scoreType === 'distancia') {
    if ('meters' in formData && 'centimeters' in formData) {
      const totalMeters = Number(formData.meters) + (Number(formData.centimeters) / 100);
      scoreData = {
        valor_pontuacao: totalMeters,
        unidade: 'm'
      };
      
      if (formData.heat) {
        scoreData.bateria_id = formData.heat;
      }
      if (formData.lane) {
        scoreData.raia = formData.lane;
      }
    } else if ('score' in formData) {
      scoreData = {
        valor_pontuacao: Number(formData.score) || 0,
        unidade: 'm'
      };
      
      if (formData.heat) {
        scoreData.bateria_id = formData.heat;
      }
      if (formData.lane) {
        scoreData.raia = formData.lane;
      }
    }
  } else if (rule?.regra_tipo === 'tempo' || scoreType === 'tempo') {
    if ('minutes' in formData) {
      const minutes = Number(formData.minutes) || 0;
      const seconds = Number(formData.seconds) || 0;
      const milliseconds = Number(formData.milliseconds) || 0;
      
      // Convert to total seconds (more precise for database storage)
      const totalSeconds = (minutes * 60) + seconds + (milliseconds / 1000);
      
      scoreData = {
        valor_pontuacao: totalSeconds,
        unidade: 'segundos',
        tempo_minutos: minutes,
        tempo_segundos: seconds,
        tempo_milissegundos: milliseconds
      };
      
      if (formData.heat) {
        scoreData.bateria_id = formData.heat;
      }
      
      if (formData.lane) {
        scoreData.raia = formData.lane;
      }
    }
  } else {
    scoreData = {
      valor_pontuacao: Number(formData.score) || 0,
      unidade: 'pontos'
    };
    
    if (formData.heat) {
      scoreData.bateria_id = formData.heat;
    }
    if (formData.lane) {
      scoreData.raia = formData.lane;
    }
  }
  
  // Ensure we ALWAYS have a valid valor_pontuacao - NEVER allow null
  if (scoreData.valor_pontuacao === undefined || scoreData.valor_pontuacao === null || isNaN(scoreData.valor_pontuacao)) {
    console.log('Invalid valor_pontuacao found, setting to 0');
    scoreData.valor_pontuacao = 0;
  }
  
  console.log('Prepared score data:', scoreData);
  
  return { scoreData };
}

export function prepareFinalScoreData(
  scoreData: any,
  formData: any,
  judgeId: string,
  eventId: string,
  modalityId: number,
  athlete: AthleteData
) {
  const finalData: any = {
    valor_pontuacao: scoreData.valor_pontuacao,
    unidade: scoreData.unidade,
    observacoes: formData.notes || null,
    juiz_id: judgeId,
    data_registro: new Date().toISOString(),
    evento_id: eventId,
    modalidade_id: modalityId,
    atleta_id: athlete.atleta_id,
    equipe_id: athlete.equipe_id || null
  };

  // Add time fields if they exist
  if (scoreData.tempo_minutos !== undefined) {
    finalData.tempo_minutos = scoreData.tempo_minutos;
  }
  if (scoreData.tempo_segundos !== undefined) {
    finalData.tempo_segundos = scoreData.tempo_segundos;
  }
  if (scoreData.tempo_milissegundos !== undefined) {
    finalData.tempo_milissegundos = scoreData.tempo_milissegundos;
  }

  // Add optional fields only if they exist
  if (scoreData.bateria_id !== undefined) {
    finalData.bateria_id = scoreData.bateria_id;
  }
  if (scoreData.raia !== undefined) {
    finalData.raia = scoreData.raia;
  }

  console.log('Final score data prepared:', finalData);
  return finalData;
}
