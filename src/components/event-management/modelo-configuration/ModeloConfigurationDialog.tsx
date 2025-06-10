
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ModeloConfigurationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (modeloId: number, parametros: any) => Promise<void>;
  editingModelo: any;
  isSaving: boolean;
}

export function ModeloConfigurationDialog({
  isOpen,
  onClose,
  onSave,
  editingModelo,
  isSaving
}: ModeloConfigurationDialogProps) {
  const [config, setConfig] = useState({
    baterias: false,
    num_raias: 8,
    permite_final: false,
    regra_tipo: 'pontos',
    formato_resultado: '',
    tipo_calculo: '',
    campo_referencia: '',
    contexto: '',
    ordem_calculo: 'asc'
  });

  useEffect(() => {
    if (editingModelo) {
      const parametros = editingModelo.parametros || {};
      setConfig({
        baterias: parametros.baterias || false,
        num_raias: parametros.num_raias || 8,
        permite_final: parametros.permite_final || false,
        regra_tipo: parametros.regra_tipo || 'pontos',
        formato_resultado: parametros.formato_resultado || '',
        tipo_calculo: parametros.tipo_calculo || '',
        campo_referencia: parametros.campo_referencia || '',
        contexto: parametros.contexto || '',
        ordem_calculo: parametros.ordem_calculo || 'asc'
      });
    }
  }, [editingModelo]);

  // Automaticamente define formato e campo de referência quando regra_tipo muda
  const handleRegraTypeChange = (value: string) => {
    const newConfig = { ...config, regra_tipo: value };
    
    if (value === 'tempo') {
      newConfig.formato_resultado = 'tempo';
      newConfig.campo_referencia = 'tempo';
    }
    
    setConfig(newConfig);
  };

  const handleSave = async () => {
    if (!editingModelo) return;
    
    await onSave(editingModelo.id, config);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Configurar Modelo: {editingModelo?.codigo_modelo || editingModelo?.descricao}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurações de Bateria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="baterias">Usar Sistema de Baterias</Label>
                  <p className="text-sm text-muted-foreground">
                    Permite organizar competições em baterias/grupos
                  </p>
                </div>
                <Switch
                  id="baterias"
                  checked={config.baterias}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, baterias: checked }))}
                />
              </div>
              
              {config.baterias && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="num_raias">Número de Raias por Bateria</Label>
                    <Input
                      id="num_raias"
                      type="number"
                      min="1"
                      max="20"
                      value={config.num_raias}
                      onChange={(e) => setConfig(prev => ({ ...prev, num_raias: Number(e.target.value) }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="permite_final">Permitir Bateria Final</Label>
                      <p className="text-sm text-muted-foreground">
                        Habilita criação de bateria final para definir vencedores
                      </p>
                    </div>
                    <Switch
                      id="permite_final"
                      checked={config.permite_final}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, permite_final: checked }))}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurações de Pontuação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="regra_tipo">Tipo de Regra</Label>
                <Select
                  value={config.regra_tipo}
                  onValueChange={handleRegraTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de regra" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pontos">Pontos</SelectItem>
                    <SelectItem value="tempo">Tempo</SelectItem>
                    <SelectItem value="distancia">Distância</SelectItem>
                    <SelectItem value="sets">Sets</SelectItem>
                    <SelectItem value="arrows">Flechas (Tiro com Arco)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="formato_resultado">Formato de Resultado</Label>
                <Select
                  value={config.formato_resultado}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, formato_resultado: value }))}
                  disabled={config.regra_tipo === 'tempo'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tempo">Tempo (MM:SS.mmm)</SelectItem>
                    <SelectItem value="distancia">Distância (m,cm)</SelectItem>
                    <SelectItem value="pontos">Pontos (###.##)</SelectItem>
                  </SelectContent>
                </Select>
                {config.regra_tipo === 'tempo' && (
                  <p className="text-sm text-muted-foreground">
                    Automaticamente definido como "Tempo" quando o tipo de regra é tempo
                  </p>
                )}
              </div>

              {config.regra_tipo === 'tempo' && (
                <div className="space-y-2">
                  <Label htmlFor="tipo_calculo">Tipo de Cálculo</Label>
                  <Select
                    value={config.tipo_calculo}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, tipo_calculo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de cálculo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="colocacao_bateria">Colocação por Bateria</SelectItem>
                      <SelectItem value="colocacao_final">Colocação Final</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {config.tipo_calculo && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="campo_referencia">Campo de Referência</Label>
                    <Input
                      id="campo_referencia"
                      placeholder="Ex: tempo, distancia, pontos"
                      value={config.campo_referencia}
                      onChange={(e) => setConfig(prev => ({ ...prev, campo_referencia: e.target.value }))}
                      disabled={config.regra_tipo === 'tempo'}
                    />
                    {config.regra_tipo === 'tempo' && (
                      <p className="text-sm text-muted-foreground">
                        Automaticamente definido como "tempo" quando o tipo de regra é tempo
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contexto">Contexto do Cálculo</Label>
                    <Select
                      value={config.contexto}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, contexto: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o contexto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bateria">Bateria - Classificação dentro de cada bateria</SelectItem>
                        <SelectItem value="modalidade">Modalidade - Classificação geral da modalidade</SelectItem>
                        <SelectItem value="evento">Evento - Classificação em todo o evento</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Bateria:</strong> Cada bateria tem seus próprios colocados (1º, 2º, 3º...)</p>
                      <p><strong>Modalidade:</strong> Todos os resultados da modalidade são comparados</p>
                      <p><strong>Evento:</strong> Comparação entre modalidades do evento</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ordem_calculo">Ordem de Cálculo</Label>
                    <Select
                      value={config.ordem_calculo}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, ordem_calculo: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a ordem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Crescente (menor = melhor)</SelectItem>
                        <SelectItem value="desc">Decrescente (maior = melhor)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Configuração'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
