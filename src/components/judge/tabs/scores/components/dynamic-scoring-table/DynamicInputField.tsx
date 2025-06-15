import React from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MaskedResultInput } from '@/components/judge/dynamic-scoring/MaskedResultInput';
import { CampoModelo } from '@/types/dynamicScoring';

interface DynamicInputFieldProps {
  campo: CampoModelo;
  athleteId: string;
  value: string | number;
  onChange: (value: string | number) => void;
  selectedBateriaId?: number | null;
  athleteIndex?: number; // New prop to determine the sequential number
}

export function DynamicInputField({ 
  campo, 
  athleteId, 
  value, 
  onChange,
  selectedBateriaId,
  athleteIndex = 0
}: DynamicInputFieldProps) {
  
  console.log(`DynamicInputField - ${campo.chave_campo}:`, {
    athleteId,
    campo: campo.chave_campo,
    currentValue: value,
    tipo: campo.tipo_input,
    athleteIndex
  });

  // Se é um campo calculado, mostrar apenas o valor sem botão de calcular individual
  if (campo.tipo_input === 'calculated') {
    const displayValue = value || '-';
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        {displayValue}
      </Badge>
    );
  }

  // Lógica especial para o campo "Bateria"
  if (campo.chave_campo === 'bateria' || campo.chave_campo === 'numero_bateria') {
    // Auto-fill with sequential numbers starting from 1
    let displayValue: string;
    
    if (value) {
      // If there's already a saved value, use it
      displayValue = value === '999' || value === 999 ? 'Final' : value.toString();
    } else if (selectedBateriaId) {
      // If there's a selected bateria, use its number
      displayValue = selectedBateriaId === 999 ? 'Final' : selectedBateriaId.toString();
    } else {
      // Auto-fill with sequential number starting from 1
      displayValue = (athleteIndex + 1).toString();
      // Auto-set the value when component renders
      if (!value) {
        onChange(athleteIndex + 1);
      }
    }
    
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        {displayValue}
      </Badge>
    );
  }

  const handleChange = (newValue: string | number) => {
    console.log(`DynamicInputField - onChange for ${campo.chave_campo}:`, {
      athleteId,
      campo: campo.chave_campo,
      oldValue: value,
      newValue
    });
    onChange(newValue);
  };

  switch (campo.tipo_input) {
    case 'number':
      return (
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => {
            const numValue = parseFloat(e.target.value) || 0;
            handleChange(numValue);
          }}
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
          value={value || ''}
          onChange={(e) => {
            const intValue = parseInt(e.target.value) || 0;
            handleChange(intValue);
          }}
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
            value={value as string || ''}
            onChange={(newValue) => handleChange(newValue)}
          />
        );
      }
      return (
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={campo.rotulo_campo}
          className="w-full"
        />
      );
    
    case 'select':
      return (
        <select
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
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
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={campo.rotulo_campo}
          className="w-full"
        />
      );
  }
}
