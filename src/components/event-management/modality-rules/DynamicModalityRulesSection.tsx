
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ModalidadesList } from './ModalidadesList';
import { ModelosList } from './ModelosList';
import { CamposModeloManager } from './CamposModeloManager';
import { ModeloModalidadeDialog } from './ModeloModalidadeDialog';
import { useModalidadesData } from './hooks/useModalidadesData';
import { useModelosModalidade, useDeleteModelo } from '@/hooks/useDynamicScoring';
import { ModeloModalidade } from '@/types/dynamicScoring';

interface DynamicModalityRulesSectionProps {
  eventId: string | null;
}

export function DynamicModalityRulesSection({ eventId }: DynamicModalityRulesSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModalidadeId, setSelectedModalidadeId] = useState<number | null>(null);
  const [selectedModeloId, setSelectedModeloId] = useState<number | null>(null);
  const [isCreateModeloDialogOpen, setIsCreateModeloDialogOpen] = useState(false);
  const [editingModelo, setEditingModelo] = useState<ModeloModalidade | null>(null);

  const { modalidades } = useModalidadesData();
  const { data: modelos = [], isLoading: isLoadingModelos } = useModelosModalidade(selectedModalidadeId || undefined);
  const deleteModeloMutation = useDeleteModelo();

  const handleCreateModelo = () => {
    setEditingModelo(null);
    setIsCreateModeloDialogOpen(true);
  };

  const handleEditModelo = (modelo: ModeloModalidade) => {
    setEditingModelo(modelo);
    setIsCreateModeloDialogOpen(true);
  };

  const handleDeleteModelo = async (modeloId: number) => {
    try {
      await deleteModeloMutation.mutateAsync(modeloId);
    } catch (error) {
      console.error('Error deleting modelo:', error);
    }
  };

  const handleCloseModeloDialog = () => {
    setIsCreateModeloDialogOpen(false);
    setEditingModelo(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      {selectedModalidadeId && (
        <CamposModeloManager
          modalidadeId={selectedModalidadeId}
          modelos={modelos}
          selectedModeloId={selectedModeloId}
          onModeloSelect={setSelectedModeloId}
        />
      )}

      <ModeloModalidadeDialog
        open={isCreateModeloDialogOpen}
        onOpenChange={setIsCreateModeloDialogOpen}
        modalidadeId={selectedModalidadeId}
        editingModelo={editingModelo}
        onClose={handleCloseModeloDialog}
      />
    </div>
  );
}
