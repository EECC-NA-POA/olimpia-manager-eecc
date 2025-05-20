
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ScheduleForm as ScheduleFormType } from './types';

interface ScheduleFormProps {
  currentItem: ScheduleFormType;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (field: string, value: string) => void;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  currentItem,
  handleInputChange,
  handleSelectChange
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          name="titulo"
          value={currentItem.titulo}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="data">Data</Label>
          <Input
            id="data"
            name="data"
            type="date"
            value={currentItem.data}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo</Label>
          <Select 
            value={currentItem.tipo} 
            onValueChange={(value) => handleSelectChange('tipo', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="JOGO">Jogo</SelectItem>
              <SelectItem value="CERIMONIA">Cerimônia</SelectItem>
              <SelectItem value="TREINAMENTO">Treinamento</SelectItem>
              <SelectItem value="REUNIAO">Reunião</SelectItem>
              <SelectItem value="OUTRO">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="hora_inicio">Hora de Início</Label>
          <Input
            id="hora_inicio"
            name="hora_inicio"
            type="time"
            value={currentItem.hora_inicio}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="hora_fim">Hora de Término</Label>
          <Input
            id="hora_fim"
            name="hora_fim"
            type="time"
            value={currentItem.hora_fim}
            onChange={handleInputChange}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="local">Local</Label>
        <Input
          id="local"
          name="local"
          value={currentItem.local}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          name="descricao"
          value={currentItem.descricao}
          onChange={handleInputChange}
          rows={3}
        />
      </div>
    </div>
  );
};
