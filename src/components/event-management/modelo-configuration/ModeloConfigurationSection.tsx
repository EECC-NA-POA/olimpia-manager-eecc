import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import { ModeloConfigurationTable } from './ModeloConfigurationTable';
import { ModeloConfigurationFilters } from './ModeloConfigurationFilters';
import { ModeloConfigurationDialog } from './ModeloConfigurationDialog';
import { ModeloDuplicationDialog } from './ModeloDuplicationDialog';
import { useModeloConfigurationData } from './hooks/useModeloConfigurationData';
import { useModeloConfigurationMutations } from './hooks/useModeloConfigurationMutations';
import { useModeloFiltering } from './hooks/useModeloFiltering';

export function ModeloConfigurationSection({ eventId }: { eventId: string | null }) {
  console.log('ModeloConfigurationSection - eventId:', eventId);
  
  const { modelos, isLoading, refetch } = useModeloConfigurationData(eventId);
  const { isSaving, isDuplicating, saveConfiguration, duplicateModelo } = useModeloConfigurationMutations(refetch);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDuplicationDialogOpen, setIsDuplicationDialogOpen] = useState(false);
  const [editingModelo, setEditingModelo] = useState<any>(null);
  const [modeloToDuplicate, setModeloToDuplicate] = useState<any>(null);

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
          nome: modelo.modalidade.nome
        });
      }
      if (modelo.modalidade?.categoria) {
        uniqueCategories.add(modelo.modalidade.categoria);
      }
    });
    
    return {
      modalities: Array.from(uniqueModalities.values()).sort((a, b) => 
        a.nome.localeCompare(b.nome)
      ),
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

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Modelos de Pontuação</CardTitle>
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
    </>
  );
}
