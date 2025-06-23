
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import { useModalitiesData } from './modalities/hooks/useModalitiesData';
import { useModalityMutations } from './modalities/hooks/useModalityMutations';
import { ModalityFormDialog } from './modalities/ModalityFormDialog';
import { ModalitiesTable } from './modalities/ModalitiesTable';
import { ModalitiesSearch } from './modalities/ModalitiesSearch';

export function EventModalitiesSection({ eventId }: { eventId: string | null }) {
  const { modalities, isLoading, addModality, updateModality, removeModality } = useModalitiesData(eventId);
  const { isSaving, saveModality, deleteModality } = useModalityMutations(eventId);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModality, setEditingModality] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const openAddDialog = () => {
    setEditingModality(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (modality) => {
    setEditingModality(modality);
    setIsDialogOpen(true);
  };

  const handleSave = async (modalityData) => {
    const success = await saveModality(
      modalityData, 
      editingModality?.id || null,
      editingModality ? updateModality : addModality
    );
    return success;
  };

  const handleDelete = async (id) => {
    await deleteModality(id, () => removeModality(id));
  };

  const filteredModalities = modalities.filter(item => 
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.grupo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <Card>
        <CardContent className="px-3 sm:px-6 py-4 sm:py-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="flex-1 max-w-md">
                <ModalitiesSearch 
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />
              </div>
              <Button 
                onClick={openAddDialog} 
                className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary w-full sm:w-auto text-xs sm:text-sm"
                size="sm"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> 
                <span className="hidden xs:inline">Adicionar Modalidade</span>
                <span className="xs:hidden">Adicionar</span>
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <ModalitiesTable 
                modalities={filteredModalities}
                onEdit={openEditDialog}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <ModalityFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        editingModality={editingModality}
        isSaving={isSaving}
      />
    </>
  );
}
