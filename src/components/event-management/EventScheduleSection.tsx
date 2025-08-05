
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
    handleModalitiesChange,
    handleDiaToggle,
    handleHorarioChange,
    handleLocalChange,
    handleDataFimRecorrenciaChange,
    handleSave,
    handleDelete
  } = useScheduleData(eventId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8 sm:py-12">
        <LoadingImage text="Carregando cronograma..." />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h3 className="text-base sm:text-lg font-medium">Cronograma do Evento</h3>
              <Button 
                onClick={openAddDialog} 
                className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary w-full sm:w-auto flex items-center justify-center gap-2 text-xs sm:text-sm px-3 py-2"
                size="sm"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="whitespace-nowrap">Adicionar Atividade</span>
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <ScheduleTable 
                scheduleItems={scheduleItems}
                openEditDialog={openEditDialog}
                handleDelete={handleDelete}
                formatDate={formatDate}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <ScheduleDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingId ? 'Editar Atividade do Cronograma' : 'Adicionar Atividade ao Cronograma'}
        currentItem={currentItem}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleModalitiesChange={handleModalitiesChange}
        handleDiaToggle={handleDiaToggle}
        handleHorarioChange={handleHorarioChange}
        handleLocalChange={handleLocalChange}
        handleDataFimRecorrenciaChange={handleDataFimRecorrenciaChange}
        handleSave={handleSave}
        isSaving={isSaving}
      />
    </>
  );
}
