
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CampoModelo } from '@/types/dynamicScoring';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';

interface FieldsManagerProps {
  campos: CampoModelo[];
  form: UseFormReturn<any>;
}

export function FieldsManager({ campos, form }: FieldsManagerProps) {
  // Separar campos manuais e calculados
  const manualFields = campos.filter(campo => campo.tipo_input !== 'calculated');
  const calculatedFields = campos.filter(campo => campo.tipo_input === 'calculated');

  return (
    <div className="space-y-4">
      {/* Campos manuais primeiro */}
      {manualFields
        .sort((a, b) => a.ordem_exibicao - b.ordem_exibicao)
        .map(campo => (
          <DynamicFieldRenderer key={campo.id} campo={campo} form={form} />
        ))}

      {/* Campos calculados por último */}
      {calculatedFields
        .sort((a, b) => a.ordem_exibicao - b.ordem_exibicao)
        .map(campo => (
          <DynamicFieldRenderer key={campo.id} campo={campo} form={form} />
        ))}
    </div>
  );
}
