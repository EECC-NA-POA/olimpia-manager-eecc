
import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EventBasicInfoFormValues } from './eventFormSchema';

interface EventDateFieldsProps {
  register: UseFormRegister<EventBasicInfoFormValues>;
}

export function EventDateFields({ register }: EventDateFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="data_inicio_evento">Data de Início do Evento</Label>
        <Input 
          id="data_inicio_evento" 
          type="date" 
          {...register('data_inicio_evento')} 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="data_fim_evento">Data de Fim do Evento</Label>
        <Input 
          id="data_fim_evento" 
          type="date" 
          {...register('data_fim_evento')} 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="data_inicio_inscricao">Início das Inscrições</Label>
        <Input 
          id="data_inicio_inscricao" 
          type="date" 
          {...register('data_inicio_inscricao')} 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="data_fim_inscricao">Fim das Inscrições</Label>
        <Input 
          id="data_fim_inscricao" 
          type="date" 
          {...register('data_fim_inscricao')} 
        />
      </div>
    </>
  );
}
