
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import { useModelosModalidade, useDeleteModelo } from '@/hooks/useDynamicScoring';
import { ModeloModalidadeDialog } from './ModeloModalidadeDialog';
import { CamposModeloManager } from './CamposModeloManager';
import { ModalidadesList } from './ModalidadesList';
import { ModelosList } from './ModelosList';
import { useModalidadesData } from './hooks/useModalidadesData';

export function DynamicModalityRulesSection({ eventId }: { eventId: string | null }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModalidadeId, setSelectedModalidadeId] = useState<number | null>(null);
  const [isModeloDialogOpen, setIsModeloDialogOpen] = useState(false);
  const [editingModelo, setEditingModelo] = useState<any>(null);

  // Fetch modalidades for this event
  const { data: modalidades = [], isLoading: isLoadingModalidades } = useModalidadesData(eventId);

  // Fetch modelos for the selected modalidade
  const { data: modelos = [], isLoading: isLoadingModelos } = useModelosModalidade(
    selectedModalidadeId || undefined
  );

  const deleteModeloMutation = useDeleteModelo();

  const handleCreateModelo = () => {
    if (!selectedModalidadeId) return;
    setEditingModelo(null);
    setIsModeloDialogOpen(true);
  };

  const handleEditModelo = (modelo: any) => {
    setEditingModelo(modelo);
    setIsModeloDialogOpen(true);
  };

  const handleDeleteModelo = async (modeloId: number) => {
    if (!confirm('Tem certeza que deseja excluir este modelo? Todos os campos relacionados também serão excluídos.')) {
      return;
    }
    
    deleteModeloMutation.mutate(modeloId);
  };

  if (isLoadingModalidades) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Modelos de Pontuação Dinâmica</CardTitle>
          <div className="text-sm text-muted-foreground">
            Configure modelos de pontuação personalizados para cada modalidade
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <ModalidadesList
                modalidades={modalidades}
                selectedModalidadeId={selectedModalidadeId}
                onModalidadeSelect={setSelectedModalidadeId}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />

              <ModelosList
                modelos={modelos}
                modalidades={modalidades}
                selectedModalidadeId={selectedModalidadeId}
                isLoadingModelos={isLoadingModelos}
                onCreateModelo={handleCreateModelo}
                onEditModelo={handleEditModelo}
                onDeleteModelo={handleDeleteModelo}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campos Management */}
      {modelos.length > 0 && (
        <CamposModeloManager modelos={modelos} />
      )}

      {/* Modelo Dialog */}
      <ModeloModalidadeDialog
        isOpen={isModeloDialogOpen}
        onClose={() => setIsModeloDialogOpen(false)}
        modalidadeId={selectedModalidadeId}
        editingModelo={editingModelo}
      />
    </div>
  );
}
