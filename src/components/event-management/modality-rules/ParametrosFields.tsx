
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
                <SelectItem value="quilometros">Quilômetros</SelectItem>
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
                <SelectItem value="mm">Milímetros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Máximo Subunidade</Label>
            <Input
              type="number"
              min="0"
              max="999"
              value={currentItem.parametros.max_subunidade || 99}
              onChange={(e) => updateParametros('max_subunidade', parseInt(e.target.value) || 99)}
              placeholder="Ex: 99 para centímetros"
            />
          </div>
          <div>
            <Label>Formato de Exibição</Label>
            <Select 
              value={currentItem.parametros.formato_exibicao || 'decimal'} 
              onValueChange={(value) => updateParametros('formato_exibicao', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="decimal">Decimal (ex: 1.50m)</SelectItem>
                <SelectItem value="separado">Separado (ex: 1m 50cm)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Precisão (casas decimais)</Label>
            <Input
              type="number"
              min="0"
              max="4"
              value={currentItem.parametros.precisao || 2}
              onChange={(e) => updateParametros('precisao', parseInt(e.target.value) || 2)}
              placeholder="Ex: 2 para duas casas decimais"
            />
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
                <SelectItem value="ss.SSS">ss.SSS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Precisão de Milissegundos</Label>
            <Select 
              value={currentItem.parametros.precisao_ms || '2'} 
              onValueChange={(value) => updateParametros('precisao_ms', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sem milissegundos</SelectItem>
                <SelectItem value="1">1 casa decimal</SelectItem>
                <SelectItem value="2">2 casas decimais</SelectItem>
                <SelectItem value="3">3 casas decimais</SelectItem>
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
              max="10"
              value={currentItem.parametros.num_tentativas || 3}
              onChange={(e) => updateParametros('num_tentativas', parseInt(e.target.value) || 3)}
            />
          </div>
          <div>
            <Label>Número de Raias (opcional)</Label>
            <Input
              type="number"
              min="1"
              max="20"
              value={currentItem.parametros.num_raias || ''}
              onChange={(e) => updateParametros('num_raias', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Ex: 8 para piscina olímpica"
            />
          </div>
          <div>
            <Label>Unidade de Medida</Label>
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
                <SelectItem value="centimetros">Centímetros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={currentItem.parametros.melhor_resultado !== false}
              onCheckedChange={(checked) => updateParametros('melhor_resultado', checked)}
            />
            <Label>Considerar melhor resultado (se desmarcado, considera último)</Label>
          </div>
        </div>
      );
    
    case 'sets':
      return (
        <div className="space-y-4">
          <div>
            <Label>Melhor de Quantos Sets</Label>
            <Input
              type="number"
              min="1"
              max="7"
              value={currentItem.parametros.melhor_de || currentItem.parametros.num_sets || 3}
              onChange={(e) => updateParametros('melhor_de', parseInt(e.target.value) || 3)}
            />
          </div>
          <div>
            <Label>Sets Necessários Para Vencer</Label>
            <Input
              type="number"
              min="1"
              value={currentItem.parametros.vencer_sets_para_seguir || Math.ceil((currentItem.parametros.melhor_de || 3) / 2)}
              onChange={(e) => updateParametros('vencer_sets_para_seguir', parseInt(e.target.value) || 2)}
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
            <Label>Unidade de Medida</Label>
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
          <div>
            <Label>Número de Flechas</Label>
            <Input
              type="number"
              min="1"
              max="36"
              value={currentItem.parametros.num_flechas || 6}
              onChange={(e) => updateParametros('num_flechas', parseInt(e.target.value) || 6)}
            />
          </div>
          <div>
            <Label>Número de Ends (Séries)</Label>
            <Input
              type="number"
              min="1"
              max="12"
              value={currentItem.parametros.num_ends || 1}
              onChange={(e) => updateParametros('num_ends', parseInt(e.target.value) || 1)}
              placeholder="Ex: 6 ends de 6 flechas cada"
            />
          </div>
          <div>
            <Label>Pontuação Máxima por Zona</Label>
            <Input
              type="number"
              min="1"
              max="10"
              value={currentItem.parametros.pontuacao_maxima || 10}
              onChange={(e) => updateParametros('pontuacao_maxima', parseInt(e.target.value) || 10)}
              placeholder="Ex: 10 para tiro com arco olímpico"
            />
          </div>
        </div>
      );

    case 'pontos':
      return (
        <div className="space-y-4">
          <div>
            <Label>Pontuação Mínima</Label>
            <Input
              type="number"
              min="0"
              value={currentItem.parametros.pontuacao_minima || 0}
              onChange={(e) => updateParametros('pontuacao_minima', parseFloat(e.target.value) || 0)}
              placeholder="Ex: 0"
            />
          </div>
          <div>
            <Label>Pontuação Máxima (opcional)</Label>
            <Input
              type="number"
              min="0"
              value={currentItem.parametros.pontuacao_maxima || ''}
              onChange={(e) => updateParametros('pontuacao_maxima', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="Ex: 100"
            />
          </div>
          <div>
            <Label>Incremento</Label>
            <Select 
              value={currentItem.parametros.incremento?.toString() || '1'} 
              onValueChange={(value) => updateParametros('incremento', parseFloat(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 (números inteiros)</SelectItem>
                <SelectItem value="0.5">0.5 (meio ponto)</SelectItem>
                <SelectItem value="0.1">0.1 (um décimo)</SelectItem>
                <SelectItem value="0.01">0.01 (centésimo)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    
    default:
      return null;
  }
}
