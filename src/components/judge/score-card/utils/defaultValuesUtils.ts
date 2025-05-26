
export const getDefaultValues = (initialValues: any, rule: any) => {
  if (initialValues) {
    return initialValues;
  }

  if (!rule) {
    return { score: 0, notes: '' };
  }

  const parametros = rule.parametros || {};

  switch (rule.regra_tipo) {
    case 'tempo':
      return {
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
        notes: ''
      };

    case 'distancia':
      if (parametros.subunidade === 'cm') {
        let defaults: any = {
          meters: 0,
          centimeters: 0,
          notes: ''
        };
        
        if (parametros.baterias) {
          defaults.heat = 1;
          if (parametros.raias_por_bateria) {
            defaults.lane = 1;
          }
        }
        
        return defaults;
      }
      return {
        score: 0,
        notes: ''
      };

    case 'baterias':
      const numTentativas = parametros.num_tentativas || 3;
      return {
        tentativas: Array.from({ length: numTentativas }, () => ({ valor: 0, raia: '' })),
        notes: ''
      };

    case 'sets':
      const melhorDe = parametros.melhor_de || parametros.num_sets || 3;
      const pontuaPorSet = parametros.pontua_por_set !== false;
      const isVolleyball = parametros.pontos_por_set !== undefined;
      
      if (pontuaPorSet) {
        return {
          sets: Array.from({ length: melhorDe }, () => ({ pontos: 0 })),
          notes: ''
        };
      } else if (isVolleyball) {
        return {
          sets: Array.from({ length: melhorDe }, () => ({ 
            vencedor: undefined, 
            pontosEquipe1: 0, 
            pontosEquipe2: 0 
          })),
          notes: ''
        };
      } else {
        return {
          sets: Array.from({ length: melhorDe }, () => ({ vencedor: undefined })),
          notes: ''
        };
      }

    case 'arrows':
      const faseClassificacao = parametros.fase_classificacao || false;
      const faseEliminacao = parametros.fase_eliminacao || false;
      
      if (faseClassificacao || faseEliminacao) {
        let defaults: any = { notes: '' };
        
        if (faseClassificacao) {
          const numFlechasClassificacao = parametros.num_flechas_classificacao || 72;
          defaults.classificationArrows = Array.from({ length: numFlechasClassificacao }, () => ({ score: 0 }));
        }
        
        if (faseEliminacao) {
          const setsPorCombate = parametros.sets_por_combate || 5;
          const flechasPorSet = parametros.flechas_por_set || 3;
          
          defaults.eliminationSets = Array.from({ length: setsPorCombate }, () => ({
            arrows: Array.from({ length: flechasPorSet }, () => ({ score: 0 })),
            total: 0,
            matchPoints: 0
          }));
          defaults.totalMatchPoints = 0;
          defaults.combatFinished = false;
          defaults.needsShootOff = false;
          
          if (parametros.shoot_off) {
            defaults.shootOffScore = 0;
          }
        }
        
        return defaults;
      } else {
        // Simple arrows format
        const numFlechas = parametros.num_flechas || 6;
        return {
          flechas: Array.from({ length: numFlechas }, () => ({ zona: '0' })),
          notes: ''
        };
      }

    default:
      return {
        score: 0,
        notes: ''
      };
  }
};
