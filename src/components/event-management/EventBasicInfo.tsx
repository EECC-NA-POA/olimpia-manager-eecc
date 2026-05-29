
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useEventBasicInfoForm } from './eventForm/useEventBasicInfoForm';
import { EventBasicDetailsFields } from './eventForm/EventBasicDetailsFields';
import { EventLocationFields } from './eventForm/EventLocationFields';
import { EventDateFields } from './eventForm/EventDateFields';
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
    handleHasScoresChange,
    handleHasAttendanceChange,
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

            <div className="space-y-4 pt-6">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="visibilidade_publica">Visibilidade Pública</Label>
                <Switch
                  id="visibilidade_publica"
                  checked={visibilidadePublica}
                  onCheckedChange={handleVisibilidadeChange}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="has_scores" className="flex-1">Módulo de Pontuações (Competição) <span className="block text-xs text-muted-foreground font-normal">Habilita os rankings, chaves e pontuações para este evento.</span></Label>
                <Switch
                  id="has_scores"
                  checked={watch('has_scores')}
                  onCheckedChange={handleHasScoresChange}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="has_attendance" className="flex-1">Módulo de Chamadas (Presença) <span className="block text-xs text-muted-foreground font-normal">Habilita o controle de presença (chamadas) para os participantes do evento.</span></Label>
                <Switch
                  id="has_attendance"
                  checked={watch('has_attendance')}
                  onCheckedChange={handleHasAttendanceChange}
                />
              </div>
            </div>
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
