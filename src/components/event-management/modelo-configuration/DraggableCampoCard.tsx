
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { GripVertical, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
    opacity: isDragging ? 0.5 : 1,
  };

  const isRequiredField = campo.chave_campo === 'resultado' || campo.chave_campo === 'bateria' || campo.chave_campo === 'numero_bateria';

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`${isDragging ? 'shadow-lg' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div 
              className="flex flex-col items-center gap-1 mt-2 cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{index + 1}</span>
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={isRequiredField ? "default" : "secondary"}>
                    {isRequiredField ? "Obrigatório" : "Opcional"}
                  </Badge>
                  {campo.chave_campo === 'resultado' && (
                    <Badge variant="outline" className="text-green-600">
                      Campo Principal
                    </Badge>
                  )}
                </div>
                
                {!isRequiredField && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(campo.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`chave-${campo.id}`}>Chave do Campo</Label>
                  <Input
                    id={`chave-${campo.id}`}
                    value={campo.chave_campo}
                    onChange={(e) => onUpdate(campo.id, { chave_campo: e.target.value })}
                    placeholder="ex: tempo, pontos"
                    disabled={isRequiredField}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`rotulo-${campo.id}`}>Rótulo</Label>
                  <Input
                    id={`rotulo-${campo.id}`}
                    value={campo.rotulo_campo}
                    onChange={(e) => onUpdate(campo.id, { rotulo_campo: e.target.value })}
                    placeholder="ex: Tempo, Pontos, Resultado"
                    // Allow editing the label for all fields, including resultado
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`tipo-${campo.id}`}>Tipo de Input</Label>
                  <Select
                    value={campo.tipo_input}
                    onValueChange={(value) => onUpdate(campo.id, { tipo_input: value })}
                    disabled={campo.chave_campo === 'resultado'} // Resultado is always text with mask
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="integer">Número Inteiro</SelectItem>
                      <SelectItem value="select">Seleção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Obrigatório</Label>
                  <div className="flex items-center space-x-2 h-10">
                    <Switch
                      checked={campo.obrigatorio}
                      onCheckedChange={(checked) => onUpdate(campo.id, { obrigatorio: checked })}
                      disabled={isRequiredField} // Required fields cannot be made optional
                    />
                    <span className="text-sm text-muted-foreground">
                      {campo.obrigatorio ? 'Sim' : 'Não'}
                    </span>
                  </div>
                </div>
              </div>

              {campo.chave_campo === 'resultado' && (
                <div className="bg-green-50 p-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600">
                      {campo.metadados?.formato_resultado === 'tempo' ? 'MM:SS.mmm' : 
                       campo.metadados?.formato_resultado === 'distancia' ? '##,## m' : 
                       '###.##'}
                    </Badge>
                    <span className="text-sm text-green-700">
                      Máscara aplicada automaticamente baseada no tipo de regra
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
