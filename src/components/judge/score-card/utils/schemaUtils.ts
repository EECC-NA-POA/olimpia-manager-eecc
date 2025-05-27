
import { z } from 'zod';

export function createDynamicSchema(ruleType: string, parameters: any) {
  console.log('createDynamicSchema - ruleType:', ruleType);
  console.log('createDynamicSchema - parameters:', parameters);
  
  let schema = z.object({
    notes: z.string().optional(),
  });

  if (ruleType === 'tempo') {
    if (parameters?.baterias) {
      schema = schema.extend({
        heat: z.coerce.number().min(1).default(1),
        lane: z.coerce.number().min(1).default(1),
        minutes: z.coerce.number().min(0).default(0),
        seconds: z.coerce.number().min(0).max(59).default(0),
        milliseconds: z.coerce.number().min(0).max(99).default(0),
      });
    } else {
      schema = schema.extend({
        minutes: z.coerce.number().min(0).default(0),
        seconds: z.coerce.number().min(0).max(59).default(0),
        milliseconds: z.coerce.number().min(0).max(99).default(0),
      });
    }
  } else if (ruleType === 'distancia') {
    if (parameters?.baterias) {
      schema = schema.extend({
        heat: z.coerce.number().min(1).default(1),
        lane: z.coerce.number().min(1).default(1),
        meters: z.coerce.number().min(0).default(0),
        centimeters: z.coerce.number().min(0).max(99).default(0),
      });
    } else {
      schema = schema.extend({
        meters: z.coerce.number().min(0).default(0),
        centimeters: z.coerce.number().min(0).max(99).default(0),
      });
    }
  } else if (['pontos', 'sets', 'arrows'].includes(ruleType)) {
    if (parameters?.baterias) {
      schema = schema.extend({
        heat: z.coerce.number().min(1).default(1),
        lane: z.coerce.number().min(1).default(1),
        score: z.coerce.number().min(0).default(0),
      });
    } else {
      schema = schema.extend({
        score: z.coerce.number().min(0).default(0),
      });
    }
  } else {
    // Fallback for unknown rule types
    schema = schema.extend({
      score: z.coerce.number().min(0).default(0),
    });
  }

  console.log('createDynamicSchema - final schema keys:', Object.keys(schema.shape));
  return schema;
}
