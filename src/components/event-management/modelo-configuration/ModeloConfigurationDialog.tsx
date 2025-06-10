
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ModeloConfigurationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (modeloId: number, parametros: any) => void;
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
  const [parametros, setParametros] = useState({
    baterias: false,
    num_raias: 8,
    permite_final: true
  });

  useEffect(() => {
    if (editingModelo?.parametros) {
      setParametros({
        baterias: editingModelo.parametros.baterias || false,
        num_raias: editingModelo.parametros.num_raias || 8,
        permite_final: editingModelo.parametros.permite_final !== false
      });
    } else {
      setParametros({
        baterias: false,
        num_raias: 8,
        permite_final: true
      });
    }
  }, [editingModelo]);

  const handleSave = () => {
    if (editingModelo) {
      onSave(editingModelo.id, parametros);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Configurar Modelo: {editingModelo?.codigo_modelo || editingModelo?.descricao}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurações de Baterias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Usar Sistema de Baterias</Label>
                  <p className="text-sm text-muted-foreground">
                    Permite criar e gerenciar baterias para esta modalidade
                  </p>
                </div>
                <Switch
                  checked={parametros.baterias}
                  onCheckedChange={(checked) => 
                    setParametros(prev => ({ ...prev, baterias: checked }))
                  }
                />
              </div>

              {parametros.baterias && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="num_raias">Número de Raias por Bateria</Label>
                    <Input
                      id="num_raias"
                      type="number"
                      min="1"
                      max="20"
                      value={parametros.num_raias}
                      onChange={(e) => 
                        setParametros(prev => ({ 
                          ...prev, 
                          num_raias: parseInt(e.target.value) || 8 
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Permitir Bateria Final</Label>
                      <p className="text-sm text-muted-foreground">
                        Permite criar uma bateria final para definir colocações
                      </p>
                    </div>
                    <Switch
                      checked={parametros.permite_final}
                      onCheckedChange={(checked) => 
                        setParametros(prev => ({ ...prev, permite_final: checked }))
                      }
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
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
