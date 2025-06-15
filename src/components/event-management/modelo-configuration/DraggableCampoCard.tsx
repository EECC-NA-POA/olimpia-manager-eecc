
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical } from 'lucide-react';

interface CampoConfig {
  id: string;
  chave_campo: string;
  rotulo_campo: string;
  tipo_input: string;
  obrigatorio: boolean;
  ordem_exibicao: number;
  metadados: any;
}

interface DraggableCampoCardProps {
  campo: CampoConfig;
  index: number;
  totalCampos: number;
  onUpdate: (id: string, updates: Partial<CampoConfig>) => void;
  onRemove: (id: string) => void;
}

export function DraggableCampoCard({
  campo,
  index,
  totalCampos,
  onUpdate,
  onRemove
}: DraggableCampoCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: campo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const updateCampo = (updates: Partial<CampoConfig>) => {
    onUpdate(campo.id, updates);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-4 space-y-3 bg-white ${
        isDragging ? 'opacity-50 shadow-lg z-50' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          >
            <GripVertical className="h-4 w-4 text-gray-500" />
          </div>
          <h4 className="font-medium">
            Campo {index + 1}
            {campo.chave_campo === 'bateria' && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Auto-adicionado
              </span>
            )}
          </h4>
        </div>
        {totalCampos > 1 && campo.chave_campo !== 'bateria' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(campo.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Chave do Campo</Label>
          <Input
            value={campo.chave_campo}
            onChange={(e) => updateCampo({ chave_campo: e.target.value })}
            placeholder="Ex: tempo, pontos, distancia"
            disabled={campo.chave_campo === 'bateria'}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Rótulo do Campo</Label>
          <Input
            value={campo.rotulo_campo}
            onChange={(e) => updateCampo({ rotulo_campo: e.target.value })}
            placeholder="Ex: Tempo Final, Pontuação"
            disabled={campo.chave_campo === 'bateria'}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Tipo de Input</Label>
          <Select
            value={campo.tipo_input}
            onValueChange={(value) => updateCampo({ tipo_input: value })}
            disabled={campo.chave_campo === 'bateria'}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">Número</SelectItem>
              <SelectItem value="integer">Inteiro</SelectItem>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="calculated">Calculado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Ordem de Exibição</Label>
          <Input
            type="number"
            value={campo.ordem_exibicao}
            onChange={(e) => updateCampo({ ordem_exibicao: Number(e.target.value) })}
            min="1"
            disabled={campo.chave_campo === 'bateria'}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id={`obrigatorio_${campo.id}`}
            checked={campo.obrigatorio}
            onCheckedChange={(checked) => updateCampo({ obrigatorio: checked })}
            disabled={campo.chave_campo === 'bateria'}
          />
          <Label htmlFor={`obrigatorio_${campo.id}`}>Obrigatório</Label>
        </div>
      </div>
    </div>
  );
}
