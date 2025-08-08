import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, Filter } from 'lucide-react';
import { ScheduleTable } from '@/components/event-management/schedule/ScheduleTable';
import { ScheduleDialog } from '@/components/event-management/schedule/ScheduleDialog';
import { useMonitorScheduleData } from './hooks/useMonitorScheduleData';
import { useMonitorModalities } from '@/hooks/useMonitorModalities';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const MonitorSchedulePage: React.FC = () => {
  const [selectedModalidade, setSelectedModalidade] = useState<string>('all');
  const { data: modalidades = [], isLoading: modalidadesLoading } = useMonitorModalities();
  const validModalidades = modalidades.filter(modalidade => modalidade.modalidades?.nome);
  
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
  } = useMonitorScheduleData(selectedModalidade === 'all' ? null : Number(selectedModalidade));

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const filteredItems = selectedModalidade === 'all' 
    ? scheduleItems 
    : scheduleItems.filter(item => 
        item.modalidades.includes(Number(selectedModalidade)) || item.global
      );

  const getDialogTitle = () => {
    return editingId ? 'Editar Atividade de Cronograma' : 'Nova Atividade de Cronograma';
  };

  if (modalidadesLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-background via-muted/20 to-background p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Cronograma das Modalidades
            </h2>
            <p className="text-muted-foreground mt-1">
              Gerencie o cronograma das modalidades que você representa
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total de Atividades</p>
              <p className="text-2xl font-bold text-primary">{filteredItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Filtrar por modalidade:</span>
                <Select value={selectedModalidade} onValueChange={setSelectedModalidade}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Selecione uma modalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as modalidades</SelectItem>
                    {validModalidades.map((modalidade) => (
                      <SelectItem key={modalidade.modalidade_id} value={modalidade.modalidade_id.toString()}>
                        {modalidade.modalidades.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={openAddDialog}
              className="bg-primary hover:bg-primary/90"
              disabled={validModalidades.length === 0}
              title={validModalidades.length === 0 ? 'Você não possui modalidades vinculadas' : undefined}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Atividade
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                  <div className="h-4 bg-muted rounded flex-1"></div>
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-4 bg-muted rounded w-32"></div>
                </div>
              ))}
            </div>
          ) : (
            <ScheduleTable
              scheduleItems={filteredItems}
              openEditDialog={openEditDialog}
              handleDelete={handleDelete}
              formatDate={formatDate}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal de Criação/Edição */}
        <ScheduleDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={getDialogTitle()}
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
          availableModalidades={validModalidades.map(m => m.modalidade_id)}
        />
    </div>
  );
};