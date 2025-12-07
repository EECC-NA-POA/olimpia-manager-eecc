
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEventBasicInfoForm } from './eventForm/useEventBasicInfoForm';
import { EventBasicDetailsFields } from './eventForm/EventBasicDetailsFields';
import { EventLocationFields } from './eventForm/EventLocationFields';
import { EventDateFields } from './eventForm/EventDateFields';
import { EventVisibilityToggle } from './eventForm/EventVisibilityToggle';
import { EventDescriptionField } from './eventForm/EventDescriptionField';

interface EventBasicInfoProps {
  eventId: string | null;
  eventData: any;
  onUpdate: () => void;
}

export function EventBasicInfo({ eventId, eventData, onUpdate }: EventBasicInfoProps) {
  const { 
    isLoading, 
    handleStatusChange, 
    handleTipoChange, 
    handleVisibilidadeChange,
    register, 
    handleSubmit, 
    onSubmit,
    formState: { errors },
    watch
  } = useEventBasicInfoForm({ eventId, eventData, onUpdate });
  
  const visibilidadePublica = watch('visibilidade_publica');

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EventBasicDetailsFields 
              register={register}
              errors={errors}
              handleTipoChange={handleTipoChange}
              handleStatusChange={handleStatusChange}
              statusValue={watch('status_evento') || 'ativo'}
              tipoValue={watch('tipo') || 'estadual'}
            />
            
            <EventLocationFields register={register} />
            
            <EventDateFields register={register} />

            <EventVisibilityToggle 
              isVisible={visibilidadePublica} 
              onToggle={handleVisibilidadeChange} 
            />
          </div>
          
          <EventDescriptionField register={register} errors={errors} />
          
          <div className="flex justify-end">
            <Button type="submit" className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
