
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RuleForm } from './types';

interface ParametrosFieldsProps {
  currentItem: RuleForm;
  updateParametros: (field: string, value: any) => void;
}

export function ParametrosFields({ currentItem, updateParametros }: ParametrosFieldsProps) {
  switch (currentItem.regra_tipo) {
    case 'distancia':
      return (
        <div className="space-y-4">
          <div>
            <Label>Unidade</Label>
            <Select 
              value={currentItem.parametros.unidade || 'metros'} 
              onValueChange={(value) => updateParametros('unidade', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metros">Metros</SelectItem>
                <SelectItem value="centimetros">Centímetros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    
    case 'tempo':
      return (
        <div className="space-y-4">
          <div>
            <Label>Formato do Tempo</Label>
            <Select 
              value={currentItem.parametros.formato_tempo || 'mm:ss.SS'} 
              onValueChange={(value) => updateParametros('formato_tempo', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mm:ss.SS">mm:ss.SS</SelectItem>
                <SelectItem value="hh:mm:ss">hh:mm:ss</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    
    case 'baterias':
      return (
        <div className="space-y-4">
          <div>
            <Label>Número de Tentativas</Label>
            <Input
              type="number"
              min="1"
              value={currentItem.parametros.num_tentativas || 1}
              onChange={(e) => updateParametros('num_tentativas', parseInt(e.target.value))}
            />
          </div>
          <div>
            <Label>Número de Raias (opcional)</Label>
            <Input
              type="number"
              min="1"
              value={currentItem.parametros.num_raias || ''}
              onChange={(e) => updateParametros('num_raias', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
          <div>
            <Label>Unidade</Label>
            <Select 
              value={currentItem.parametros.unidade || 'pontos'} 
              onValueChange={(value) => updateParametros('unidade', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pontos">Pontos</SelectItem>
                <SelectItem value="tempo">Tempo</SelectItem>
                <SelectItem value="metros">Metros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    
    case 'sets':
      return (
        <div className="space-y-4">
          <div>
            <Label>Número de Sets</Label>
            <Input
              type="number"
              min="1"
              value={currentItem.parametros.num_sets || 1}
              onChange={(e) => updateParametros('num_sets', parseInt(e.target.value))}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={currentItem.parametros.pontua_por_set !== false}
              onCheckedChange={(checked) => updateParametros('pontua_por_set', checked)}
            />
            <Label>Pontua por set (se desmarcado, apenas vitórias contam)</Label>
          </div>
        </div>
      );
    
    case 'arrows':
      return (
        <div className="space-y-4">
          <div>
            <Label>Número de Flechas</Label>
            <Input
              type="number"
              min="1"
              value={currentItem.parametros.num_flechas || 6}
              onChange={(e) => updateParametros('num_flechas', parseInt(e.target.value))}
            />
          </div>
        </div>
      );
    
    default:
      return null;
  }
}
