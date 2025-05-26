
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
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
  onResetParameters: () => void;
}

export function ParametrosFields({ currentItem, updateParametros, onResetParameters }: ParametrosFieldsProps) {
  switch (currentItem.regra_tipo) {
    case 'distancia':
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Parâmetros de Distância</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetParameters}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Resetar
            </Button>
          </div>
          
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
          <div>
            <Label>Subunidade</Label>
            <Select 
              value={currentItem.parametros.subunidade || 'cm'} 
              onValueChange={(value) => updateParametros('subunidade', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cm">Centímetros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Máximo Subunidade</Label>
            <Input
              type="number"
              min="0"
              max="99"
              value={currentItem.parametros.max_subunidade || 99}
              onChange={(e) => updateParametros('max_subunidade', parseInt(e.target.value))}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={currentItem.parametros.baterias || false}
              onCheckedChange={(checked) => updateParametros('baterias', checked)}
            />
            <Label>Usar baterias (múltiplas séries)</Label>
          </div>
          {currentItem.parametros.baterias && (
            <div>
              <Label>Raias por Bateria</Label>
              <Input
                type="number"
                min="1"
                max="10"
                placeholder="Ex: 8 (número de raias por bateria)"
                value={currentItem.parametros.raias_por_bateria || ''}
                onChange={(e) => updateParametros('raias_por_bateria', e.target.value ? parseInt(e.target.value) : undefined)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Define quantas raias cada bateria terá (obrigatório para controle de raias)
              </p>
            </div>
          )}
        </div>
      );
    
    case 'tempo':
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Parâmetros de Tempo</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetParameters}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Resetar
            </Button>
          </div>
          
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
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Parâmetros de Baterias</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetParameters}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Resetar
            </Button>
          </div>
          
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
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Parâmetros de Sets</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetParameters}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Resetar
            </Button>
          </div>
          
          <div>
            <Label>Melhor de Quantos Sets</Label>
            <Input
              type="number"
              min="1"
              max="7"
              value={currentItem.parametros.melhor_de || currentItem.parametros.num_sets || 3}
              onChange={(e) => updateParametros('melhor_de', parseInt(e.target.value))}
            />
          </div>
          <div>
            <Label>Sets Necessários Para Vencer</Label>
            <Input
              type="number"
              min="1"
              value={currentItem.parametros.vencer_sets_para_seguir || Math.ceil((currentItem.parametros.melhor_de || 3) / 2)}
              onChange={(e) => updateParametros('vencer_sets_para_seguir', parseInt(e.target.value))}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={currentItem.parametros.pontua_por_set !== false}
              onCheckedChange={(checked) => updateParametros('pontua_por_set', checked)}
            />
            <Label>Pontua por set (se desmarcado, apenas vitórias contam)</Label>
          </div>
          
          <div>
            <Label>Unidade</Label>
            <Select 
              value={currentItem.parametros.unidade || 'sets'} 
              onValueChange={(value) => updateParametros('unidade', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sets">Sets</SelectItem>
                <SelectItem value="vitórias">Vitórias</SelectItem>
                <SelectItem value="pontos">Pontos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(currentItem.parametros.unidade === 'sets' || !currentItem.parametros.unidade) && (
            <>
              <div>
                <Label>Pontos por Set (Sets 1-4)</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="25 (para voleibol)"
                  value={currentItem.parametros.pontos_por_set || ''}
                  onChange={(e) => updateParametros('pontos_por_set', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
              <div>
                <Label>Pontos Set Final (Set 5)</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="15 (para voleibol)"
                  value={currentItem.parametros.pontos_set_final || ''}
                  onChange={(e) => updateParametros('pontos_set_final', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
              <div>
                <Label>Vantagem Mínima</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="2 (para voleibol)"
                  value={currentItem.parametros.vantagem || ''}
                  onChange={(e) => updateParametros('vantagem', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
            </>
          )}
        </div>
      );
    
    case 'arrows':
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Parâmetros de Flechas</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetParameters}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Resetar
            </Button>
          </div>
          
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
    
    case 'pontos':
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Parâmetros de Pontos</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetParameters}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Resetar
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Modalidade de pontos simples - não há parâmetros adicionais para configurar.
          </p>
        </div>
      );
    
    default:
      return null;
  }
}
