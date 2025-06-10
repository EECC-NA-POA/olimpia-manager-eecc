
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CampoModelo } from '@/types/dynamicScoring';
import { NumberField } from './NumberField';
import { TextField } from './TextField';
import { SelectField } from './SelectField';
import { CalculatedField } from './CalculatedField';

interface DynamicFieldRendererProps {
  campo: CampoModelo;
  form: UseFormReturn<any>;
}

export function DynamicFieldRenderer({ campo, form }: DynamicFieldRendererProps) {
  switch (campo.tipo_input) {
    case 'calculated':
      return <CalculatedField campo={campo} form={form} />;
    
    case 'number':
    case 'integer':
      return <NumberField campo={campo} form={form} />;
    
    case 'text':
      return <TextField campo={campo} form={form} />;
    
    case 'select':
      return <SelectField campo={campo} form={form} />;
    
    default:
      return null;
  }
}
