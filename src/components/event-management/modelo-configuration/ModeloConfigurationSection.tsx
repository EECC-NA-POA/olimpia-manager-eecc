
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import { ModeloConfigurationTable } from './ModeloConfigurationTable';
import { ModeloConfigurationDialog } from './ModeloConfigurationDialog';
import { useModeloConfigurationData } from './hooks/useModeloConfigurationData';
import { useModeloConfigurationMutations } from './hooks/useModeloConfigurationMutations';

export function ModeloConfigurationSection({ eventId }: { eventId: string | null }) {
  const { modelos, isLoading, refetch } = useModeloConfigurationData(eventId);
  const { isSaving, saveConfiguration } = useModeloConfigurationMutations(refetch);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModelo, setEditingModelo] = useState<any>(null);

  const openConfigDialog = (modelo: any) => {
    setEditingModelo(modelo);
    setIsDialogOpen(true);
  };

  const handleSaveConfiguration = async (modeloId: number, parametros: any) => {
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
          <ModeloConfigurationTable 
            modelos={modelos}
            onConfigure={openConfigDialog}
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
