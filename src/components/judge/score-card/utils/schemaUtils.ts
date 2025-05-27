
import { z } from 'zod';

export const createDynamicSchema = (regraTipo: string, parametros: any) => {
  const baseSchema = {
    notes: z.string().optional(),
  };

  switch (regraTipo) {
    case 'tempo':
      const baterias = parametros?.baterias === true;
      const raiasPorBateria = parametros?.raias_por_bateria;
      
      let timeSchema: any = {
        ...baseSchema,
        minutes: z.coerce.number().min(0).default(0),
        seconds: z.coerce.number().min(0).max(59).default(0),
        milliseconds: z.coerce.number().min(0).max(999).default(0),
      };
      
      // Add heat validation if baterias is enabled
      if (baterias) {
        timeSchema.heat = z.coerce.number().min(1, "Bateria deve ser maior que 0");
        
        // Add lane validation if raiasPorBateria is specified
        if (raiasPorBateria) {
          timeSchema.lane = z.coerce.number()
            .min(1, "Raia deve ser maior que 0")
            .max(raiasPorBateria, `Raia deve ser menor ou igual a ${raiasPorBateria}`);
        }
      }
      
      return z.object(timeSchema);
    
    case 'distancia':
      const distBaterias = parametros?.baterias === true;
      const distRaiasPorBateria = parametros?.raias_por_bateria;
      
      // Base distance schema
      let distanceSchema: any = { ...baseSchema };
      
      // Add heat validation if baterias is enabled
      if (distBaterias) {
        distanceSchema.heat = z.coerce.number().min(1, "Bateria deve ser maior que 0");
        
        // Add lane validation if raiasPorBateria is specified
        if (distRaiasPorBateria) {
          distanceSchema.lane = z.coerce.number()
            .min(1, "Raia deve ser maior que 0")
            .max(distRaiasPorBateria, `Raia deve ser menor ou igual a ${distRaiasPorBateria}`);
        }
      }
      
      // Check if using meters and centimeters format
      if (parametros?.subunidade === 'cm') {
        distanceSchema.meters = z.coerce.number().min(0).default(0);
        distanceSchema.centimeters = z.coerce.number()
          .min(0)
          .max(parametros?.max_subunidade || 99)
          .default(0);
      } else {
        // Legacy single value format
        distanceSchema.score = z.coerce.number().min(0).default(0);
      }
      
      return z.object(distanceSchema);
    
    case 'pontos':
      return z.object({
        ...baseSchema,
        score: z.coerce.number().min(0).default(0),
      });
    
    case 'baterias':
      const numTentativas = parametros?.num_tentativas || 3;
      return z.object({
        ...baseSchema,
        tentativas: z.array(z.object({
          valor: z.coerce.number().min(0),
          raia: z.string().optional(),
        })).length(numTentativas),
      });
    
    case 'sets':
      const melhorDe = parametros?.melhor_de || parametros?.num_sets || 3;
      const pontuaPorSet = parametros?.pontua_por_set !== false;
      const isVolleyball = parametros?.pontos_por_set !== undefined;
      
      if (pontuaPorSet) {
        return z.object({
          ...baseSchema,
          sets: z.array(z.object({
            pontos: z.coerce.number().min(0),
          })).length(melhorDe),
        });
      } else if (isVolleyball) {
        return z.object({
          ...baseSchema,
          sets: z.array(z.object({
            vencedor: z.enum(['vitoria', 'derrota']).optional(),
            pontosEquipe1: z.coerce.number().min(0).optional(),
            pontosEquipe2: z.coerce.number().min(0).optional(),
          })).max(melhorDe),
        });
      } else {
        return z.object({
          ...baseSchema,
          sets: z.array(z.object({
            vencedor: z.enum(['vitoria', 'derrota']).optional(),
          })).max(melhorDe),
        });
      }
    
    case 'arrows':
      // Check if this is Olympic-style archery with phases
      const faseClassificacao = parametros?.fase_classificacao || false;
      const faseEliminacao = parametros?.fase_eliminacao || false;
      const shootOff = parametros?.shoot_off || false;
      
      if (faseClassificacao || faseEliminacao) {
        let archerySchema: any = { ...baseSchema };
        
        if (faseClassificacao) {
          const numFlechasClassificacao = parametros?.num_flechas_classificacao || 72;
          archerySchema.classificationArrows = z.array(z.object({
            score: z.coerce.number().min(0).max(10),
          })).length(numFlechasClassificacao).optional();
        }
        
        if (faseEliminacao) {
          const setsPorCombate = parametros?.sets_por_combate || 5;
          const flechasPorSet = parametros?.flechas_por_set || 3;
          
          archerySchema.eliminationSets = z.array(z.object({
            arrows: z.array(z.object({
              score: z.coerce.number().min(0).max(10),
            })).length(flechasPorSet),
            total: z.number().optional(),
            matchPoints: z.number().optional(),
          })).length(setsPorCombate).optional();
          
          archerySchema.totalMatchPoints = z.number().optional();
          archerySchema.combatFinished = z.boolean().optional();
          archerySchema.needsShootOff = z.boolean().optional();
          
          if (shootOff) {
            archerySchema.shootOffScore = z.coerce.number().min(0).max(10).optional();
          }
        }
        
        return z.object(archerySchema);
      } else {
        // Simple arrows format
        const numFlechas = parametros?.num_flechas || 6;
        return z.object({
          ...baseSchema,
          flechas: z.array(z.object({
            zona: z.string(),
          })).length(numFlechas),
        });
      }
    
    default:
      return z.object({
        ...baseSchema,
        score: z.coerce.number().min(0).default(0),
      });
  }
};
