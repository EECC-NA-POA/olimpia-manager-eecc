
import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { CampoModelo } from '@/types/dynamicScoring';

interface MaskedResultInputProps {
  campo: CampoModelo;
  form: UseFormReturn<any>;
  value?: string;
  onChange?: (value: string) => void;
}

export function MaskedResultInput({ campo, form, value, onChange }: MaskedResultInputProps) {
  const [inputValue, setInputValue] = useState(value || '');
  const formato = campo.metadados?.formato_resultado;

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const applyMask = (rawValue: string, format: string): string => {
    // Remove todos os caracteres não numéricos
    const numbers = rawValue.replace(/\D/g, '');
    
    switch (format) {
      case 'tempo':
        // Formato: MM:SS.mmm (minutos:segundos.milissegundos)
        if (numbers.length === 0) return '';
        if (numbers.length <= 2) return numbers;
        if (numbers.length <= 4) return `${numbers.slice(0, 2)}:${numbers.slice(2)}`;
        if (numbers.length <= 7) {
          const minutes = numbers.slice(0, 2);
          const seconds = numbers.slice(2, 4);
          const milliseconds = numbers.slice(4);
          return `${minutes}:${seconds}.${milliseconds}`;
        }
        // Limita a 7 dígitos (MM:SS.mmm)
        const limitedNumbers = numbers.slice(0, 7);
        const minutes = limitedNumbers.slice(0, 2);
        const seconds = limitedNumbers.slice(2, 4);
        const milliseconds = limitedNumbers.slice(4, 7);
        return `${minutes}:${seconds}.${milliseconds}`;
      
      case 'distancia':
        // Formato: ##,## m (metros e centímetros)
        if (numbers.length === 0) return '';
        if (numbers.length <= 2) return `${numbers}`;
        const meters = numbers.slice(0, -2) || '0';
        const centimeters = numbers.slice(-2);
        return `${meters},${centimeters} m`;
      
      case 'pontos':
        // Formato: ###.## (pontos com decimais)
        if (numbers.length === 0) return '';
        if (numbers.length <= 2) return `${numbers}`;
        const integer = numbers.slice(0, -2) || '0';
        const decimal = numbers.slice(-2);
        return `${integer}.${decimal}`;
      
      default:
        return rawValue;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    if (!formato) {
      setInputValue(rawValue);
      onChange?.(rawValue);
      return;
    }

    const maskedValue = applyMask(rawValue, formato);
    setInputValue(maskedValue);
    onChange?.(maskedValue);
  };

  const getPlaceholder = (): string => {
    switch (formato) {
      case 'tempo':
        return 'MM:SS.mmm';
      case 'distancia':
        return '##,## m';
      case 'pontos':
        return '###.##';
      default:
        return `Digite ${campo.rotulo_campo.toLowerCase()}`;
    }
  };

  const getDisplayUnit = (): string => {
    return campo.metadados?.unidade_display || '';
  };

  return (
    <div className="relative">
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={getPlaceholder()}
        className={formato ? 'font-mono' : ''}
        maxLength={formato === 'tempo' ? 9 : undefined} // MM:SS.mmm = 9 caracteres
      />
      {getDisplayUnit() && (
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
          {getDisplayUnit()}
        </span>
      )}
    </div>
  );
}
