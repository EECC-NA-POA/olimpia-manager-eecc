
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CampoModelo } from '@/types/dynamicScoring';
import { CalculatedFieldsManager } from './CalculatedFieldsManager';
import { FieldsManager } from './form-fields/FieldsManager';
import { filterScoringFields, filterConfigurationFields } from '@/utils/dynamicScoringUtils';

interface DynamicScoringFormProps {
  form: UseFormReturn<any>;
  campos: CampoModelo[];
  modeloId?: number;
  modalityId?: number;
  eventId?: string;
  bateriaId?: number;
}

export function DynamicScoringForm({ 
  form, 
  campos, 
  modeloId, 
  modalityId, 
  eventId,
  bateriaId 
}: DynamicScoringFormProps) {
  // Separar campos calculados para mostrar o gerenciador apenas se necessário
  const calculatedFields = campos.filter(campo => campo.tipo_input === 'calculated');
  
  // Filter out configuration fields from the main form (they should already be filtered at this point)
  const scoringFields = filterScoringFields(campos);
  
  console.log('DynamicScoringForm - All campos:', campos);
  console.log('DynamicScoringForm - Scoring fields:', scoringFields);
  console.log('DynamicScoringForm - Calculated fields:', calculatedFields);

  return (
    <div className="space-y-4">
      {/* Gerenciador de campos calculados - mostrar apenas se houver campos calculados */}
      {calculatedFields.length > 0 && modeloId && modalityId && eventId && (
        <CalculatedFieldsManager
          modeloId={modeloId}
          modalityId={modalityId}
          eventId={eventId}
          bateriaId={bateriaId}
        />
      )}

      {/* Gerenciador de campos - usar apenas campos de pontuação */}
      <FieldsManager campos={scoringFields} form={form} />
    </div>
  );
}
