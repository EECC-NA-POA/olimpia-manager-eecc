
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CampoModelo } from '@/types/dynamicScoring';

interface CalculatedFieldCardProps {
  field: CampoModelo;
}

export function CalculatedFieldCard({ field }: CalculatedFieldCardProps) {
  return (
    <div className="p-3 border rounded-lg bg-blue-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-medium text-blue-900">{field.rotulo_campo}</div>
          <div className="text-sm text-blue-700 mt-1">
            <div>Tipo: {field.metadados?.tipo_calculo}</div>
            <div>Campo de referência: {field.metadados?.campo_referencia || 'Não definido'}</div>
            <div>Ordem: {field.metadados?.ordem_calculo || 'asc'}</div>
          </div>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Calculado
        </Badge>
      </div>
    </div>
  );
}
