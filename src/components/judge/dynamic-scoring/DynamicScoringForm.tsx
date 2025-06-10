
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CampoModelo } from '@/types/dynamicScoring';
import { CalculatedFieldsManager } from './CalculatedFieldsManager';
import { FieldsManager } from './form-fields/FieldsManager';

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

      {/* Gerenciador de campos */}
      <FieldsManager campos={campos} form={form} />
    </div>
  );
}
