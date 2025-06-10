import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Copy } from 'lucide-react';

interface ModeloConfigurationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (modeloId: number, parametros: any) => Promise<void>;
  onDuplicate?: (modelo: any) => void;
  editingModelo: any;
  isSaving: boolean;
}

interface CampoConfig {
  id: string;
  chave_campo: string;
  rotulo_campo: string;
  tipo_input: string;
  obrigatorio: boolean;
  ordem_exibicao: number;
  metadados: any;
}

export function ModeloConfigurationDialog({
  isOpen,
  onClose,
  onSave,
  onDuplicate,
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

  const [campos, setCampos] = useState<CampoConfig[]>([]);

  useEffect(() => {
    if (editingModelo) {
      console.log('Loading modelo for editing:', editingModelo);
      
      // Load existing campos from the enriched model data
      let camposToLoad: any[] = [];
      
      if (editingModelo.campos_modelo && Array.isArray(editingModelo.campos_modelo)) {
        // Use campos from the enriched data
        camposToLoad = editingModelo.campos_modelo
          .filter((campo: any) => campo.chave_campo !== 'baterias' && campo.chave_campo !== 'pontuacao')
          .map((campo: any) => ({
            id: campo.id ? String(campo.id) : `campo_${Date.now()}_${Math.random()}`,
            chave_campo: campo.chave_campo || '',
            rotulo_campo: campo.rotulo_campo || '',
            tipo_input: campo.tipo_input || 'number',
            obrigatorio: campo.obrigatorio || false,
            ordem_exibicao: campo.ordem_exibicao || 1,
            metadados: campo.metadados || {}
          }));
      }
      
      console.log('Loaded campos from model:', camposToLoad);
      
      // If no campos exist, create a default one based on regra_tipo
      if (camposToLoad.length === 0) {
        const defaultCampo = createDefaultField(editingModelo.parametros?.regra_tipo || 'pontos');
        camposToLoad = [defaultCampo];
      }
      
      setCampos(camposToLoad);
      
      // Load configuration from existing campos_modelo
      let loadedConfig = {
        baterias: false,
        num_raias: 8,
        permite_final: false,
        regra_tipo: 'pontos',
        formato_resultado: '',
        tipo_calculo: '',
        campo_referencia: '',
        contexto: '',
        ordem_calculo: 'asc'
      };
      
      if (editingModelo.campos_modelo && Array.isArray(editingModelo.campos_modelo)) {
        editingModelo.campos_modelo.forEach((campo: any) => {
          if (campo.chave_campo === 'baterias' && campo.metadados) {
            loadedConfig.baterias = campo.metadados.baterias || false;
            loadedConfig.num_raias = campo.metadados.num_raias || 8;
            loadedConfig.permite_final = campo.metadados.permite_final || false;
          }
          
          if (campo.chave_campo === 'pontuacao' && campo.metadados) {
            loadedConfig.regra_tipo = campo.metadados.regra_tipo || 'pontos';
            loadedConfig.formato_resultado = campo.metadados.formato_resultado || '';
            loadedConfig.tipo_calculo = campo.metadados.tipo_calculo || '';
            loadedConfig.campo_referencia = campo.metadados.campo_referencia || '';
            loadedConfig.contexto = campo.metadados.contexto || '';
            loadedConfig.ordem_calculo = campo.metadados.ordem_calculo || 'asc';
          }
        });
      }
      
      // Fallback to parametros if available
      if (editingModelo.parametros) {
        Object.keys(loadedConfig).forEach(key => {
          if (editingModelo.parametros[key] !== undefined && loadedConfig[key as keyof typeof loadedConfig] === (key === 'regra_tipo' ? 'pontos' : key === 'baterias' ? false : key === 'num_raias' ? 8 : key === 'ordem_calculo' ? 'asc' : '')) {
            (loadedConfig as any)[key] = editingModelo.parametros[key];
          }
        });
      }
      
      console.log('Final loaded config:', loadedConfig);
      setConfig(loadedConfig);
    }
  }, [editingModelo]);

  const createDefaultField = (regraType: string): CampoConfig => {
    const baseField = {
      id: 'campo_' + Date.now(),
      chave_campo: regraType,
      rotulo_campo: getDefaultLabel(regraType),
      tipo_input: 'number',
      obrigatorio: true,
      ordem_exibicao: 1,
      metadados: {}
    };

    switch (regraType) {
      case 'tempo':
        return {
          ...baseField,
          metadados: {
            formato_resultado: 'tempo',
            placeholder: 'MM:SS.mmm'
          }
        };
      case 'distancia':
        return {
          ...baseField,
          metadados: {
            formato_resultado: 'distancia',
            placeholder: '##,## m'
          }
        };
      case 'pontos':
        return {
          ...baseField,
          metadados: {
            formato_resultado: 'pontos',
            placeholder: '###.##'
          }
        };
      default:
        return baseField;
    }
  };

  const getDefaultLabel = (regraType: string): string => {
    switch (regraType) {
      case 'tempo': return 'Tempo';
      case 'distancia': return 'Distância';
      case 'pontos': return 'Pontos';
      default: return 'Resultado';
    }
  };

  // Automaticamente define formato e campo de referência quando regra_tipo muda
  const handleRegraTypeChange = (value: string) => {
    const newConfig = { ...config, regra_tipo: value };
    
    if (value === 'tempo') {
      newConfig.formato_resultado = 'tempo';
      newConfig.campo_referencia = 'tempo';
    }
    
    setConfig(newConfig);

    // Atualizar campos existentes com o novo tipo
    const updatedCampos = campos.map(campo => ({
      ...campo,
      metadados: {
        ...campo.metadados,
        formato_resultado: value === 'tempo' ? 'tempo' : value === 'distancia' ? 'distancia' : 'pontos'
      }
    }));
    setCampos(updatedCampos);
  };

  const addCampo = () => {
    const newCampo: CampoConfig = {
      id: 'campo_' + Date.now(),
      chave_campo: '',
      rotulo_campo: '',
      tipo_input: 'number',
      obrigatorio: false,
      ordem_exibicao: campos.length + 1,
      metadados: {
        formato_resultado: config.regra_tipo === 'tempo' ? 'tempo' : config.regra_tipo === 'distancia' ? 'distancia' : 'pontos'
      }
    };
    setCampos([...campos, newCampo]);
  };

  const removeCampo = (id: string) => {
    setCampos(campos.filter(campo => campo.id !== id));
  };

  const updateCampo = (id: string, updates: Partial<CampoConfig>) => {
    setCampos(campos.map(campo => 
      campo.id === id ? { ...campo, ...updates } : campo
    ));
  };

  const handleSave = async () => {
    if (!editingModelo) return;
    
    console.log('Saving configuration...');
    console.log('Current config:', config);
    console.log('Current campos:', campos);
    
    const configWithCampos = {
      ...config,
      campos: campos.sort((a, b) => a.ordem_exibicao - b.ordem_exibicao)
    };
    
    console.log('Final config to save:', configWithCampos);
    
    try {
      await onSave(editingModelo.id, configWithCampos);
      console.log('Save completed successfully');
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleDuplicate = () => {
    if (onDuplicate && editingModelo) {
      onDuplicate(editingModelo);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              Configurar Modelo: {editingModelo?.codigo_modelo || editingModelo?.descricao}
            </DialogTitle>
            {onDuplicate && (
              <Button variant="outline" size="sm" onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-1" />
                Duplicar
              </Button>
            )}
          </div>
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
                      </SelectContent>
                    </Select>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Bateria:</strong> Cada bateria tem seus próprios colocados (1º, 2º, 3º...)</p>
                      <p><strong>Modalidade:</strong> Todos os resultados da modalidade são comparados</p>
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

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Campos do Modelo</CardTitle>
                <Button onClick={addCampo} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Campo
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {campos.map((campo, index) => (
                <div key={campo.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Campo {index + 1}</h4>
                    {campos.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCampo(campo.id)}
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
                        onChange={(e) => updateCampo(campo.id, { chave_campo: e.target.value })}
                        placeholder="Ex: tempo, pontos, distancia"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Rótulo do Campo</Label>
                      <Input
                        value={campo.rotulo_campo}
                        onChange={(e) => updateCampo(campo.id, { rotulo_campo: e.target.value })}
                        placeholder="Ex: Tempo Final, Pontuação"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tipo de Input</Label>
                      <Select
                        value={campo.tipo_input}
                        onValueChange={(value) => updateCampo(campo.id, { tipo_input: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="number">Número</SelectItem>
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
                        onChange={(e) => updateCampo(campo.id, { ordem_exibicao: Number(e.target.value) })}
                        min="1"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`obrigatorio_${campo.id}`}
                        checked={campo.obrigatorio}
                        onCheckedChange={(checked) => updateCampo(campo.id, { obrigatorio: checked })}
                      />
                      <Label htmlFor={`obrigatorio_${campo.id}`}>Obrigatório</Label>
                    </div>
                  </div>
                </div>
              ))}
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
