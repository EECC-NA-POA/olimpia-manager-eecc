
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
    item.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <Card>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <ModalitiesSearch 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              <Button 
                onClick={openAddDialog} 
                className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar Modalidade
              </Button>
            </div>
            
            <ModalitiesTable 
              modalities={filteredModalities}
              onEdit={openEditDialog}
              onDelete={handleDelete}
            />
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
