
import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EventBasicInfoFormValues } from './eventFormSchema';

interface EventLocationFieldsProps {
  register: UseFormRegister<EventBasicInfoFormValues>;
}

export function EventLocationFields({ register }: EventLocationFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="pais">País</Label>
        <Input 
          id="pais" 
          {...register('pais')} 
          placeholder="País do evento" 
          defaultValue="Brasil"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="estado">Estado</Label>
        <Input 
          id="estado" 
          {...register('estado')} 
          placeholder="Estado do evento" 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="cidade">Cidade</Label>
        <Input 
          id="cidade" 
          {...register('cidade')} 
          placeholder="Cidade do evento" 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="foto_evento">URL da Foto do Evento</Label>
        <Input 
          id="foto_evento" 
          {...register('foto_evento')} 
          placeholder="URL da foto do evento" 
        />
      </div>
    </>
  );
}
