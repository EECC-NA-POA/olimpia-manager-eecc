
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingImage } from '@/components/ui/loading-image';
import { Plus } from 'lucide-react';
import { useScheduleData } from './schedule/useScheduleData';
import { ScheduleTable } from './schedule/ScheduleTable';
import { ScheduleDialog } from './schedule/ScheduleDialog';
import { formatDate } from './schedule/utils';

export function EventScheduleSection({ eventId }: { eventId: string | null }) {
  const {
    scheduleItems,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isSaving,
    currentItem,
    editingId,
    openAddDialog,
    openEditDialog,
    handleInputChange,
    handleSelectChange,
    handleSave,
    handleDelete
  } = useScheduleData(eventId);

  if (isLoading) {
    return <LoadingImage text="Carregando cronograma..." />;
  }

  return (
    <>
      <Card>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Cronograma do Evento</h3>
              <Button 
                onClick={openAddDialog} 
                className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar Item
              </Button>
            </div>
            
            <ScheduleTable 
              scheduleItems={scheduleItems}
              openEditDialog={openEditDialog}
              handleDelete={handleDelete}
              formatDate={formatDate}
            />
          </div>
        </CardContent>
      </Card>
      
      <ScheduleDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingId ? 'Editar Item do Cronograma' : 'Adicionar Item ao Cronograma'}
        currentItem={currentItem}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleSave={handleSave}
        isSaving={isSaving}
      />
    </>
  );
}
