
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
    unidade: '',
    subunidade: ''
  });

  useEffect(() => {
    if (editingModelo) {
      const parametros = editingModelo.parametros || {};
      setConfig({
        baterias: parametros.baterias || false,
        num_raias: parametros.num_raias || 8,
        permite_final: parametros.permite_final || false,
        regra_tipo: parametros.regra_tipo || 'pontos',
        unidade: parametros.unidade || '',
        subunidade: parametros.subunidade || ''
      });
    }
  }, [editingModelo]);

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
                <select
                  id="regra_tipo"
                  className="w-full p-2 border rounded-md"
                  value={config.regra_tipo}
                  onChange={(e) => setConfig(prev => ({ ...prev, regra_tipo: e.target.value }))}
                >
                  <option value="pontos">Pontos</option>
                  <option value="tempo">Tempo</option>
                  <option value="distancia">Distância</option>
                  <option value="sets">Sets</option>
                  <option value="arrows">Flechas (Tiro com Arco)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unidade">Unidade</Label>
                <Input
                  id="unidade"
                  placeholder="Ex: metros, segundos, pontos"
                  value={config.unidade}
                  onChange={(e) => setConfig(prev => ({ ...prev, unidade: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subunidade">Subunidade</Label>
                <Input
                  id="subunidade"
                  placeholder="Ex: cm, ms"
                  value={config.subunidade}
                  onChange={(e) => setConfig(prev => ({ ...prev, subunidade: e.target.value }))}
                />
              </div>
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
