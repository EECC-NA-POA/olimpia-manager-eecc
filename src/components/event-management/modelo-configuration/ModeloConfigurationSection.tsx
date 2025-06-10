
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import { ModeloConfigurationTable } from './ModeloConfigurationTable';
import { ModeloConfigurationFilters } from './ModeloConfigurationFilters';
import { ModeloConfigurationDialog } from './ModeloConfigurationDialog';
import { useModeloConfigurationData } from './hooks/useModeloConfigurationData';
import { useModeloConfigurationMutations } from './hooks/useModeloConfigurationMutations';
import { useModeloFiltering } from './hooks/useModeloFiltering';

export function ModeloConfigurationSection({ eventId }: { eventId: string | null }) {
  console.log('ModeloConfigurationSection - eventId:', eventId);
  
  const { modelos, isLoading, refetch } = useModeloConfigurationData(eventId);
  const { isSaving, saveConfiguration } = useModeloConfigurationMutations(refetch);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModelo, setEditingModelo] = useState<any>(null);

  const {
    searchTerm,
    setSearchTerm,
    modalityFilter,
    setModalityFilter,
    useBatteryFilter,
    setUseBatteryFilter,
    sortConfig,
    filteredAndSortedModelos,
    handleSort
  } = useModeloFiltering(modelos);

  console.log('ModeloConfigurationSection - modelos:', modelos);
  console.log('ModeloConfigurationSection - filteredAndSortedModelos:', filteredAndSortedModelos);
  console.log('ModeloConfigurationSection - isLoading:', isLoading);

  // Extract unique modalities for filter
  const modalities = React.useMemo(() => {
    const uniqueModalities = new Map();
    modelos.forEach(modelo => {
      if (modelo.modalidade?.nome && modelo.modalidade_id) {
        uniqueModalities.set(modelo.modalidade_id, {
          id: modelo.modalidade_id,
          nome: modelo.modalidade.nome
        });
      }
    });
    return Array.from(uniqueModalities.values()).sort((a, b) => 
      a.nome.localeCompare(b.nome)
    );
  }, [modelos]);

  const openConfigDialog = (modelo: any) => {
    console.log('Opening config dialog for modelo:', modelo);
    setEditingModelo(modelo);
    setIsDialogOpen(true);
  };

  const handleSaveConfiguration = async (modeloId: number, parametros: any) => {
    console.log('Saving configuration for modelo:', modeloId, 'with params:', parametros);
    await saveConfiguration(modeloId, parametros);
    setIsDialogOpen(false);
    setEditingModelo(null);
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
            useBatteryFilter={useBatteryFilter}
            onUseBatteryFilterChange={setUseBatteryFilter}
            modalities={modalities}
          />
          
          <ModeloConfigurationTable 
            modelos={filteredAndSortedModelos}
            onConfigure={openConfigDialog}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </CardContent>
      </Card>
      
      <ModeloConfigurationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveConfiguration}
        editingModelo={editingModelo}
        isSaving={isSaving}
      />
    </>
  );
}
