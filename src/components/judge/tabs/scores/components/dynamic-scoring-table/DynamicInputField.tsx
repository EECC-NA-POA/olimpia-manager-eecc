
import React from 'react';
import { Input } from '@/components/ui/input';
import { MaskedResultInput } from '@/components/judge/dynamic-scoring/MaskedResultInput';
import { CalculatedFieldCell } from './CalculatedFieldCell';
import { CampoModelo } from '@/types/dynamicScoring';

interface DynamicInputFieldProps {
  campo: CampoModelo;
  athleteId: string;
  value: string | number;
  onChange: (athleteId: string, fieldKey: string, value: string | number) => void;
  needsRecalculation?: boolean;
  onCalculateField?: (fieldKey: string) => void;
  isCalculating?: boolean;
}

export function DynamicInputField({ 
  campo, 
  athleteId, 
  value, 
  onChange,
  needsRecalculation = false,
  onCalculateField,
  isCalculating = false
}: DynamicInputFieldProps) {
  
  // Se é um campo calculado, mostrar componente específico
  if (campo.tipo_input === 'calculated') {
    return (
      <CalculatedFieldCell
        campo={campo}
        athleteId={athleteId}
        value={value}
        needsRecalculation={needsRecalculation}
        onCalculate={onCalculateField}
        isCalculating={isCalculating}
      />
    );
  }

  switch (campo.tipo_input) {
    case 'number':
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(athleteId, campo.chave_campo, parseFloat(e.target.value) || 0)}
          placeholder={`${campo.metadados?.min || 0} - ${campo.metadados?.max || 100}`}
          min={campo.metadados?.min}
          max={campo.metadados?.max}
          step={campo.metadados?.step || 0.01}
          className="w-full"
        />
      );
    
    case 'integer':
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(athleteId, campo.chave_campo, parseInt(e.target.value) || 0)}
          placeholder={`${campo.metadados?.min || 0} - ${campo.metadados?.max || 100}`}
          min={campo.metadados?.min}
          max={campo.metadados?.max}
          step={1}
          className="w-full"
        />
      );
    
    case 'text':
      // Usar máscara se tiver formato específico
      if (campo.metadados?.formato_resultado) {
        return (
          <MaskedResultInput
            campo={campo}
            form={null as any}
            value={value as string}
            onChange={(newValue) => onChange(athleteId, campo.chave_campo, newValue)}
          />
        );
      }
      return (
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(athleteId, campo.chave_campo, e.target.value)}
          placeholder={campo.rotulo_campo}
          className="w-full"
        />
      );
    
    case 'select':
      return (
        <select
          value={value}
          onChange={(e) => onChange(athleteId, campo.chave_campo, e.target.value)}
          className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background text-sm"
        >
          <option value="">Selecione...</option>
          {campo.metadados?.opcoes?.map((opcao: string) => (
            <option key={opcao} value={opcao}>
              {opcao}
            </option>
          ))}
        </select>
      );
    
    default:
      return (
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(athleteId, campo.chave_campo, e.target.value)}
          placeholder={campo.rotulo_campo}
          className="w-full"
        />
      );
  }
}
