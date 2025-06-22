
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { diasSemana } from './constants';

interface RecurrenceSelectorProps {
  diasSemana: string[];
  horariosPorDia: Record<string, { inicio: string; fim: string }>;
  dataFimRecorrencia: string;
  onDiaToggle: (dia: string, checked: boolean) => void;
  onHorarioChange: (dia: string, tipo: 'inicio' | 'fim', valor: string) => void;
  onDataFimChange: (data: string) => void;
}

export const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  diasSemana: diasSelecionados,
  horariosPorDia,
  dataFimRecorrencia,
  onDiaToggle,
  onHorarioChange,
  onDataFimChange
}) => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Configuração de Recorrência</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Dias da Semana</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {diasSemana.map((dia) => (
              <div key={dia.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`dia-${dia.value}`}
                  checked={diasSelecionados.includes(dia.value)}
                  onCheckedChange={(checked) => onDiaToggle(dia.value, !!checked)}
                />
                <Label
                  htmlFor={`dia-${dia.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {dia.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {diasSelecionados.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Horários por Dia</Label>
            {diasSelecionados.map((dia) => {
              const diaLabel = diasSemana.find(d => d.value === dia)?.label || dia;
              const horario = horariosPorDia[dia] || { inicio: '', fim: '' };
              
              return (
                <div key={dia} className="p-3 border rounded-md space-y-2">
                  <Label className="text-sm font-medium text-blue-700">{diaLabel}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Início</Label>
                      <Input
                        type="time"
                        value={horario.inicio}
                        onChange={(e) => onHorarioChange(dia, 'inicio', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Fim</Label>
                      <Input
                        type="time"
                        value={horario.fim}
                        onChange={(e) => onHorarioChange(dia, 'fim', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="data-fim-recorrencia" className="text-sm font-medium">
            Data Fim da Recorrência (opcional)
          </Label>
          <Input
            id="data-fim-recorrencia"
            type="date"
            value={dataFimRecorrencia}
            onChange={(e) => onDataFimChange(e.target.value)}
            className="text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};
