
import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EventBasicInfoFormValues } from './eventFormSchema';

interface EventDescriptionFieldProps {
  register: UseFormRegister<EventBasicInfoFormValues>;
  errors: FieldErrors<EventBasicInfoFormValues>;
}

export function EventDescriptionField({ register, errors }: EventDescriptionFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="descricao">Descrição</Label>
      <Textarea 
        id="descricao" 
        {...register('descricao')} 
        placeholder="Descrição do evento"
        rows={5} 
        className={errors.descricao ? 'border-red-500' : ''}
      />
      {errors.descricao && <p className="text-sm text-red-500">{errors.descricao.message}</p>}
    </div>
  );
}
