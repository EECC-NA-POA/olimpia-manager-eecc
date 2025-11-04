import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import { ModeloConfigurationTable } from './ModeloConfigurationTable';
import { ModeloConfigurationFilters } from './ModeloConfigurationFilters';
import { ModeloConfigurationDialog } from './ModeloConfigurationDialog';
import { ModeloDuplicationDialog } from './ModeloDuplicationDialog';
import { NewModeloDialog } from './dialogs/NewModeloDialog';
import { useModeloConfigurationData } from './hooks/useModeloConfigurationData';
import { useModeloConfigurationMutations } from './hooks/useModeloConfigurationMutations';
import { useModeloFiltering } from './hooks/useModeloFiltering';
import { useCreateModelo } from '@/hooks/useDynamicScoring';

export function ModeloConfigurationSection({ eventId }: { eventId: string | null }) {
  console.log('ModeloConfigurationSection - eventId:', eventId);
  
  const { modelos, isLoading, refetch } = useModeloConfigurationData(eventId);
  const { isSaving, isDuplicating, saveConfiguration, duplicateModelo } = useModeloConfigurationMutations(refetch);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDuplicationDialogOpen, setIsDuplicationDialogOpen] = useState(false);
  const [isNewModeloDialogOpen, setIsNewModeloDialogOpen] = useState(false);
  const [editingModelo, setEditingModelo] = useState<any>(null);
  const [modeloToDuplicate, setModeloToDuplicate] = useState<any>(null);
  
  const createModeloMutation = useCreateModelo();

  const {
    searchTerm,
    setSearchTerm,
    modalityFilter,
    setModalityFilter,
    categoryFilter,
    setCategoryFilter,
    useBatteryFilter,
    setUseBatteryFilter,
    sortConfig,
    filteredAndSortedModelos,
    handleSort
  } = useModeloFiltering(modelos);

  console.log('ModeloConfigurationSection - modelos:', modelos);
  console.log('ModeloConfigurationSection - filteredAndSortedModelos:', filteredAndSortedModelos);
  console.log('ModeloConfigurationSection - isLoading:', isLoading);

  // Extract unique modalities and categories for filters
  const { modalities, categories } = React.useMemo(() => {
    const uniqueModalities = new Map();
    const uniqueCategories = new Set<string>();
    
    modelos.forEach(modelo => {
      if (modelo.modalidade?.nome && modelo.modalidade_id) {
        uniqueModalities.set(modelo.modalidade_id, {
          id: modelo.modalidade_id,
          nome: modelo.modalidade.nome,
          categoria: modelo.modalidade.categoria
        });
      }
      if (modelo.modalidade?.categoria) {
        uniqueCategories.add(modelo.modalidade.categoria);
      }
    });
    
    return {
      modalities: Array.from(uniqueModalities.values()).sort((a, b) => {
        // Sort by name first, then by category
        const nameCompare = a.nome.localeCompare(b.nome);
        if (nameCompare !== 0) return nameCompare;
        return (a.categoria || '').localeCompare(b.categoria || '');
      }),
      categories: Array.from(uniqueCategories).sort()
    };
  }, [modelos]);

  const openConfigDialog = (modelo: any) => {
    console.log('Opening config dialog for modelo:', modelo);
    setEditingModelo(modelo);
    setIsDialogOpen(true);
  };

  const openDuplicationDialog = (modelo: any) => {
    console.log('Opening duplication dialog for modelo:', modelo);
    setModeloToDuplicate(modelo);
    setIsDuplicationDialogOpen(true);
  };

  const handleSaveConfiguration = async (modeloId: number, parametros: any) => {
    console.log('Saving configuration for modelo:', modeloId, 'with params:', parametros);
    await saveConfiguration(modeloId, parametros);
    setIsDialogOpen(false);
    setEditingModelo(null);
  };

  const handleDuplicateModelo = async (targetModalidadeId: string) => {
    if (modeloToDuplicate) {
      await duplicateModelo(modeloToDuplicate, targetModalidadeId);
      setIsDuplicationDialogOpen(false);
      setModeloToDuplicate(null);
    }
  };

  const handleCreateModelo = async (data: { modalidade_id: number; codigo_modelo: string; descricao?: string }) => {
    await createModeloMutation.mutateAsync({
      modalidade_id: data.modalidade_id,
      codigo_modelo: data.codigo_modelo,
      descricao: data.descricao || null
    });
    setIsNewModeloDialogOpen(false);
    refetch();
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="space-y-1">
              <CardTitle>Configuração de Modelos de Pontuação</CardTitle>
              <p className="text-sm text-muted-foreground">
                Os modelos são criados automaticamente a partir das modalidades do evento. Configure os parâmetros de pontuação para cada modalidade aqui.
              </p>
            </div>
            <Button 
              onClick={() => setIsNewModeloDialogOpen(true)}
              className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Modelo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ModeloConfigurationFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            modalityFilter={modalityFilter}
            onModalityFilterChange={setModalityFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            useBatteryFilter={useBatteryFilter}
            onUseBatteryFilterChange={setUseBatteryFilter}
            modalities={modalities}
            categories={categories}
          />
          
          <ModeloConfigurationTable 
            modelos={filteredAndSortedModelos}
            onConfigure={openConfigDialog}
            onDuplicate={openDuplicationDialog}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </CardContent>
      </Card>
      
      <ModeloConfigurationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveConfiguration}
        onDuplicate={() => openDuplicationDialog(editingModelo)}
        editingModelo={editingModelo}
        isSaving={isSaving}
      />

      <ModeloDuplicationDialog
        isOpen={isDuplicationDialogOpen}
        onClose={() => setIsDuplicationDialogOpen(false)}
        onDuplicate={handleDuplicateModelo}
        modelo={modeloToDuplicate}
        modalities={modalities}
        isLoading={isDuplicating}
      />

      <NewModeloDialog
        isOpen={isNewModeloDialogOpen}
        onClose={() => setIsNewModeloDialogOpen(false)}
        onSave={handleCreateModelo}
        eventId={eventId}
        isSaving={createModeloMutation.isPending}
      />
    </>
  );
}
