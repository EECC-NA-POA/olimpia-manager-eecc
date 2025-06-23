
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CampoModelo } from '@/types/dynamicScoring';
import { CalculatedFieldsManager } from './CalculatedFieldsManager';
import { FieldsManager } from './form-fields/FieldsManager';
import { filterScoringFields } from '@/utils/dynamicScoringUtils';

interface DynamicScoringFormProps {
  form: UseFormReturn<any>;
  campos: CampoModelo[];
  modeloId?: number;
  modalityId?: number;
  eventId?: string;
  numeroBateria?: number; // FIXED: usar numero_bateria
}

export function DynamicScoringForm({ 
  form, 
  campos, 
  modeloId, 
  modalityId, 
  eventId,
  numeroBateria // FIXED: usar numero_bateria
}: DynamicScoringFormProps) {
  // Separar campos calculados para mostrar o gerenciador apenas se necessário
  const calculatedFields = campos.filter(campo => campo.tipo_input === 'calculated');
  
  // Filter out configuration fields from the main form - these should NEVER appear in scoring forms
  const scoringFields = filterScoringFields(campos);
  
  console.log('DynamicScoringForm - All campos:', campos.length);
  console.log('DynamicScoringForm - Scoring fields after filtering:', scoringFields.length);
  console.log('DynamicScoringForm - Calculated fields:', calculatedFields.length);
  console.log('DynamicScoringForm - Filtered out configuration fields:', campos.filter(c => !scoringFields.includes(c)).map(c => c.chave_campo));
  console.log('DynamicScoringForm - Using numero_bateria:', numeroBateria);

  return (
    <div className="space-y-4">
      {/* Gerenciador de campos calculados - mostrar apenas se houver campos calculados */}
      {calculatedFields.length > 0 && modeloId && modalityId && eventId && (
        <CalculatedFieldsManager
          modeloId={modeloId}
          modalityId={modalityId}
          eventId={eventId}
          bateriaId={numeroBateria} // This will be converted to numero_bateria internally
        />
      )}

      {/* Gerenciador de campos - usar apenas campos de pontuação (sem configuração) */}
      <FieldsManager campos={scoringFields} form={form} />
    </div>
  );
}
