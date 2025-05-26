
import { z } from 'zod';

export const createDynamicSchema = (regraTipo: string, parametros: any) => {
  const baseSchema = {
    notes: z.string().optional(),
  };

  switch (regraTipo) {
    case 'tempo':
      return z.object({
        ...baseSchema,
        minutes: z.coerce.number().min(0, 'Minutos devem ser positivos').default(0),
        seconds: z.coerce.number().min(0, 'Segundos devem ser positivos').max(59, 'Segundos devem ser entre 0 e 59').default(0),
        milliseconds: z.coerce.number().min(0, 'Milissegundos devem ser positivos').max(999, 'Milissegundos devem ser entre 0 e 999').default(0),
      });
    
    case 'distancia':
      // Check if using meters and centimeters format
      if (parametros?.subunidade === 'cm') {
        const maxSubunidade = parametros?.max_subunidade || 99;
        return z.object({
          ...baseSchema,
          meters: z.coerce.number().min(0, 'Metros devem ser positivos').default(0),
          centimeters: z.coerce.number()
            .min(0, 'Centímetros devem ser positivos')
            .max(maxSubunidade, `Centímetros devem ser entre 0 e ${maxSubunidade}`)
            .default(0),
        });
      }
      // Legacy single value format
      return z.object({
        ...baseSchema,
        score: z.coerce.number().min(0, 'A distância deve ser positiva').default(0),
      });
    
    case 'pontos':
      return z.object({
        ...baseSchema,
        score: z.coerce.number().min(0, 'A pontuação deve ser positiva').default(0),
      });
    
    case 'baterias':
      const numTentativas = parametros?.num_tentativas || 3;
      return z.object({
        ...baseSchema,
        tentativas: z.array(z.object({
          valor: z.coerce.number().min(0, 'O valor deve ser positivo'),
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
            pontos: z.coerce.number().min(0, 'Pontos devem ser positivos'),
          })).length(melhorDe),
        });
      } else if (isVolleyball) {
        return z.object({
          ...baseSchema,
          sets: z.array(z.object({
            vencedor: z.enum(['vitoria', 'derrota']).optional(),
            pontosEquipe1: z.coerce.number().min(0, 'Pontos devem ser positivos').optional(),
            pontosEquipe2: z.coerce.number().min(0, 'Pontos devem ser positivos').optional(),
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
          zona: z.string().min(1, 'Zona é obrigatória'),
        })).length(numFlechas),
      });
    
    default:
      return z.object({
        ...baseSchema,
        score: z.coerce.number().min(0, 'A pontuação deve ser positiva').default(0),
      });
  }
};
