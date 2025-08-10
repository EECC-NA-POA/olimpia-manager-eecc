
import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EventBasicInfoFormValues } from './eventFormSchema';

interface EventBasicDetailsFieldsProps {
  register: UseFormRegister<EventBasicInfoFormValues>;
  errors: FieldErrors<EventBasicInfoFormValues>;
  handleTipoChange: (value: string) => void;
  handleStatusChange: (value: string) => void;
  defaultTipo: string;
  defaultStatus: string;
}

export function EventBasicDetailsFields({ 
  register, 
  errors, 
  handleTipoChange,
  handleStatusChange,
  defaultTipo,
  defaultStatus
}: EventBasicDetailsFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="nome">Nome do Evento</Label>
        <Input 
          id="nome" 
          {...register('nome')} 
          placeholder="Nome do evento" 
          className={errors.nome ? 'border-red-500' : ''}
        />
        {errors.nome && <p className="text-sm text-red-500">{errors.nome.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status_evento">Status do Evento</Label>
        <Select defaultValue={defaultStatus} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="suspenso">Suspenso</SelectItem>
            <SelectItem value="em_teste">Em Teste</SelectItem>
            <SelectItem value="encerrado">Encerrado</SelectItem>
            <SelectItem value="encerrado_oculto">Encerrado (Oculto)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tipo">Tipo de Evento</Label>
        <Select defaultValue={defaultTipo} onValueChange={handleTipoChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="estadual">Estadual</SelectItem>
            <SelectItem value="nacional">Nacional</SelectItem>
            <SelectItem value="internacional">Internacional</SelectItem>
            <SelectItem value="regional">Regional</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
