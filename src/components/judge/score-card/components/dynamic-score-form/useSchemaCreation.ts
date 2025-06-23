
import { z } from 'zod';
import { CampoModelo } from '@/types/dynamicScoring';

export function useSchemaCreation(campos: CampoModelo[]) {
  const createSchema = (campos: CampoModelo[]) => {
    const schemaFields: Record<string, z.ZodType> = {};
    
    campos.forEach(campo => {
      let fieldSchema: z.ZodType;
      
      // Campos calculados ou com metadados de cálculo não precisam de validação obrigatória
      const isCalculatedField = campo.tipo_input === 'calculated' || 
                               campo.metadados?.tipo_calculo || 
                               campo.chave_campo.toLowerCase().includes('colocação') ||
                               campo.chave_campo.toLowerCase().includes('colocacao');
      
      if (isCalculatedField) {
        fieldSchema = z.any().optional();
      } else {
        switch (campo.tipo_input) {
          case 'number':
          case 'integer':
            fieldSchema = z.coerce.number();
            if (campo.metadados?.min !== undefined) {
              fieldSchema = (fieldSchema as z.ZodNumber).min(campo.metadados.min);
            }
            if (campo.metadados?.max !== undefined) {
              fieldSchema = (fieldSchema as z.ZodNumber).max(campo.metadados.max);
            }
            break;
          case 'text':
          case 'select':
            fieldSchema = z.string();
            break;
          case 'checkbox':
            fieldSchema = z.boolean().optional();
            break;
          default:
            fieldSchema = z.any();
        }
        
        if (!campo.obrigatorio || isCalculatedField) {
          fieldSchema = fieldSchema.optional();
        }
      }
      
      schemaFields[campo.chave_campo] = fieldSchema;
    });

    // Add notes field
    schemaFields.notes = z.string().optional();
    
    return z.object(schemaFields);
  };

  return { createSchema };
}
