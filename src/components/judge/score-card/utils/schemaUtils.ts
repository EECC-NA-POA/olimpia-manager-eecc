
import { z } from 'zod';

export const createDynamicSchema = (regraTipo: string, parametros: any) => {
  const baseSchema = {
    notes: z.string().optional(),
  };

  switch (regraTipo) {
    case 'tempo':
      return z.object({
        ...baseSchema,
        minutes: z.coerce.number().min(0).default(0),
        seconds: z.coerce.number().min(0).max(59).default(0),
        milliseconds: z.coerce.number().min(0).max(999).default(0),
      });
    
    case 'distancia':
      // Check if using meters and centimeters format
      if (parametros?.subunidade === 'cm') {
        return z.object({
          ...baseSchema,
          meters: z.coerce.number().min(0).default(0),
          centimeters: z.coerce.number().min(0).max(99).default(0),
        });
      }
      // Legacy single value format
      return z.object({
        ...baseSchema,
        score: z.coerce.number().min(0).default(0),
      });
    
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
      const numFlechas = parametros?.num_flechas || 6;
      return z.object({
        ...baseSchema,
        flechas: z.array(z.object({
          zona: z.string(),
        })).length(numFlechas),
      });
    
    default:
      return z.object({
        ...baseSchema,
        score: z.coerce.number().min(0).default(0),
      });
  }
};
