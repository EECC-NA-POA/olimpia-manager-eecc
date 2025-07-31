
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useCamposModelo, useDeleteCampo } from '@/hooks/useDynamicScoring';
import { ModeloModalidade } from '@/types/dynamicScoring';
import { CampoModeloDialog } from './CampoModeloDialog';

interface CamposModeloManagerProps {
  modelos: ModeloModalidade[];
}

export function CamposModeloManager({ modelos }: CamposModeloManagerProps) {
  const [selectedModeloId, setSelectedModeloId] = useState<number>(modelos[0]?.id || 0);
  const [isCampoDialogOpen, setIsCampoDialogOpen] = useState(false);
  const [editingCampo, setEditingCampo] = useState<any>(null);

  const { data: campos = [], isLoading } = useCamposModelo(selectedModeloId);
  const deleteCompoMutation = useDeleteCampo();

  const selectedModelo = modelos.find(m => m.id === selectedModeloId);

  const handleCreateCampo = () => {
    setEditingCampo(null);
    setIsCampoDialogOpen(true);
  };

  const handleEditCampo = (campo: any) => {
    setEditingCampo(campo);
    setIsCampoDialogOpen(true);
  };

  const handleDeleteCampo = async (campoId: number) => {
    if (!confirm('Tem certeza que deseja excluir este campo?')) {
      return;
    }
    
    deleteCompoMutation.mutate({ id: campoId, modelo_id: selectedModeloId });
  };

  const getTipoInputLabel = (tipo: string) => {
    switch (tipo) {
      case 'number': return 'Número';
      case 'text': return 'Texto';
      case 'select': return 'Seleção';
      default: return tipo;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campos dos Modelos</CardTitle>
        <div className="text-sm text-muted-foreground">
          Configure os campos de entrada para cada modelo de pontuação
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Model Selector */}
          <div className="flex gap-2 flex-wrap">
            {modelos.map((modelo) => (
              <Button
                key={modelo.id}
                variant={selectedModeloId === modelo.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedModeloId(modelo.id)}
              >
                {modelo.descricao || modelo.codigo_modelo}
              </Button>
            ))}
          </div>

          {selectedModelo && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  Campos do Modelo: {selectedModelo.descricao || selectedModelo.codigo_modelo}
                </h3>
                <Button size="sm" onClick={handleCreateCampo} className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary">
                  <Plus className="h-4 w-4 mr-1" />
                  Novo Campo
                </Button>
              </div>

              {isLoading ? (
                <div className="text-center py-4 text-muted-foreground">
                  Carregando campos...
                </div>
              ) : campos.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhum campo configurado para este modelo
                </div>
              ) : (
                <div className="space-y-2">
                  {campos.map((campo) => (
                    <div key={campo.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{campo.rotulo_campo}</span>
                            <Badge variant="secondary" className="text-xs">
                              {campo.chave_campo}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getTipoInputLabel(campo.tipo_input)}
                            </Badge>
                            {campo.obrigatorio && (
                              <Badge variant="destructive" className="text-xs">
                                Obrigatório
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Ordem: {campo.ordem_exibicao}
                            {campo.metadados && (
                              <span className="ml-2">
                                {campo.metadados.min !== undefined && `Min: ${campo.metadados.min}`}
                                {campo.metadados.max !== undefined && ` Max: ${campo.metadados.max}`}
                                {campo.metadados.step !== undefined && ` Step: ${campo.metadados.step}`}
                                {campo.metadados.opcoes && ` Opções: ${campo.metadados.opcoes.join(', ')}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditCampo(campo)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteCampo(campo.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <CampoModeloDialog
          isOpen={isCampoDialogOpen}
          onClose={() => setIsCampoDialogOpen(false)}
          modeloId={selectedModeloId}
          editingCampo={editingCampo}
        />
      </CardContent>
    </Card>
  );
}
