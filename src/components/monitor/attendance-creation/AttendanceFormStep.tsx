
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import AthletesList from './AthletesList';

interface Athlete {
  id: string;
  nome_completo: string;
  email: string;
  numero_identificador: string | null;
}

interface AttendanceFormStepProps {
  modalityName: string;
  sessionForm: {
    data_hora_inicio: string;
    data_hora_fim: string;
    descricao: string;
  };
  onSessionFormChange: (form: any) => void;
  athletes: Athlete[] | undefined;
  onNext: () => void;
  onCancel: () => void;
}

export default function AttendanceFormStep({
  modalityName,
  sessionForm,
  onSessionFormChange,
  athletes,
  onNext,
  onCancel
}: AttendanceFormStepProps) {
  return (
    <div className="space-y-4 py-2 max-h-[70vh] overflow-auto">
      <div className="space-y-2">
        <Label htmlFor="modalidade">Modalidade</Label>
        <Input
          value={modalityName}
          disabled
          className="bg-gray-100"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="data_hora_inicio">Data e Hora de Início *</Label>
        <Input
          id="data_hora_inicio"
          type="datetime-local"
          value={sessionForm.data_hora_inicio}
          onChange={(e) => onSessionFormChange({ ...sessionForm, data_hora_inicio: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="data_hora_fim">Data e Hora de Fim</Label>
        <Input
          id="data_hora_fim"
          type="datetime-local"
          value={sessionForm.data_hora_fim}
          onChange={(e) => onSessionFormChange({ ...sessionForm, data_hora_fim: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição (opcional)</Label>
        <Textarea
          id="descricao"
          value={sessionForm.descricao}
          onChange={(e) => onSessionFormChange({ ...sessionForm, descricao: e.target.value })}
          placeholder="Descreva o objetivo desta chamada..."
          className="min-h-[80px] resize-none"
        />
      </div>

      {athletes && athletes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">
              {athletes.length} atleta{athletes.length !== 1 ? 's' : ''} inscrito{athletes.length !== 1 ? 's' : ''} nesta modalidade:
            </span>
          </div>
          
          <AthletesList athletes={athletes} />
        </div>
      )}
      
      <div className="flex gap-2 pt-2">
        <Button 
          onClick={onNext}
          disabled={!sessionForm.data_hora_inicio || !athletes || athletes.length === 0}
          className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary flex-1"
        >
          Próximo: Marcar Presenças
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
