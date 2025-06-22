
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScheduleForm as ScheduleFormType } from './types';
import { RecurrenceSelector } from './RecurrenceSelector';

interface ScheduleFormProps {
  currentItem: ScheduleFormType;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (field: string, value: string | number | boolean) => void;
  handleDiaToggle: (dia: string, checked: boolean) => void;
  handleHorarioChange: (dia: string, tipo: 'inicio' | 'fim', valor: string) => void;
  handleDataFimRecorrenciaChange: (data: string) => void;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  currentItem,
  handleInputChange,
  handleSelectChange,
  handleDiaToggle,
  handleHorarioChange,
  handleDataFimRecorrenciaChange
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="atividade">Atividade</Label>
        <Input
          id="atividade"
          name="atividade"
          value={currentItem.atividade}
          onChange={handleInputChange}
          placeholder="Nome da atividade"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="recorrente"
          checked={currentItem.recorrente}
          onCheckedChange={(checked) => handleSelectChange('recorrente', !!checked)}
        />
        <Label htmlFor="recorrente">Atividade recorrente</Label>
      </div>

      {!currentItem.recorrente ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dia">Dia</Label>
            <Input
              id="dia"
              name="dia"
              type="date"
              value={currentItem.dia}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="local">Local</Label>
            <Input
              id="local"
              name="local"
              value={currentItem.local}
              onChange={handleInputChange}
              placeholder="Local da atividade"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="horario_inicio">Horário de Início</Label>
            <Input
              id="horario_inicio"
              name="horario_inicio"
              type="time"
              value={currentItem.horario_inicio}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="horario_fim">Horário de Término</Label>
            <Input
              id="horario_fim"
              name="horario_fim"
              type="time"
              value={currentItem.horario_fim}
              onChange={handleInputChange}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="local">Local</Label>
            <Input
              id="local"
              name="local"
              value={currentItem.local}
              onChange={handleInputChange}
              placeholder="Local da atividade"
            />
          </div>
          
          <RecurrenceSelector
            diasSemana={currentItem.dias_semana}
            horariosPorDia={currentItem.horarios_por_dia}
            dataFimRecorrencia={currentItem.data_fim_recorrencia}
            onDiaToggle={handleDiaToggle}
            onHorarioChange={handleHorarioChange}
            onDataFimChange={handleDataFimRecorrenciaChange}
          />
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="global"
          checked={currentItem.global}
          onCheckedChange={(checked) => handleSelectChange('global', !!checked)}
        />
        <Label htmlFor="global">Atividade global (para todas as modalidades)</Label>
      </div>
    </div>
  );
};
