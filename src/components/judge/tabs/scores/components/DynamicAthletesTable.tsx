
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calculator, ChevronDown, ChevronUp, Table as TableIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalculatedFieldsManager } from '@/components/judge/calculated-fields';
import { DynamicScoringTable } from './DynamicScoringTable';
import { BateriaNavigationTabs } from './BateriaNavigationTabs';
import { useDynamicBaterias } from '../hooks/useDynamicBaterias';
import { Athlete } from '../hooks/useAthletes';

interface DynamicAthletesTableProps {
  athletes: Athlete[];
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  modelo: any;
  modalityRule?: any;
}

export function DynamicAthletesTable({
  athletes,
  modalityId,
  eventId,
  judgeId,
  modelo,
  modalityRule
}: DynamicAthletesTableProps) {
  const [showCalculatedFields, setShowCalculatedFields] = useState(false);

  const {
    regularBaterias,
    finalBateria,
    selectedBateriaId,
    hasFinalBateria,
    usesBaterias,
    isLoading: isLoadingBaterias,
    setSelectedBateriaId,
    createNewBateria,
    createFinalBateria,
    editBateria,
    isCreating,
    isEditing
  } = useDynamicBaterias({
    modalityId,
    eventId,
    modalityRule
  });

  if (!eventId) {
    return <div>Evento não selecionado</div>;
  }

  if (isLoadingBaterias) {
    return <div>Carregando configuração de baterias...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Bateria Management */}
      {usesBaterias && (
        <BateriaNavigationTabs
          regularBaterias={regularBaterias}
          finalBateria={finalBateria}
          selectedBateriaId={selectedBateriaId}
          onSelectBateria={setSelectedBateriaId}
          onCreateNewBateria={createNewBateria}
          onCreateFinalBateria={createFinalBateria}
          onEditBateria={editBateria}
          hasFinalBateria={hasFinalBateria}
          isCreating={isCreating}
          isEditing={isEditing}
          usesBaterias={usesBaterias}
        />
      )}

      {/* Athletes scoring section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TableIcon className="h-5 w-5" />
            Registro de Pontuações
            {usesBaterias && selectedBateriaId && (
              <span className="text-sm text-muted-foreground">
                - {regularBaterias.find(b => b.id === selectedBateriaId) 
                    ? `Bateria ${regularBaterias.find(b => b.id === selectedBateriaId)?.numero}`
                    : finalBateria?.id === selectedBateriaId 
                    ? 'Bateria Final'
                    : 'Bateria Selecionada'
                  }
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DynamicScoringTable
            athletes={athletes}
            modalityId={modalityId}
            eventId={eventId}
            judgeId={judgeId}
            modelo={modelo}
            selectedBateriaId={selectedBateriaId}
          />
        </CardContent>
      </Card>

      {/* Calculated Fields Management */}
      <Collapsible open={showCalculatedFields} onOpenChange={setShowCalculatedFields}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Gerenciar Colocações
                </div>
                {showCalculatedFields ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent>
              <CalculatedFieldsManager
                modeloId={modelo.id}
                modalityId={modalityId}
                eventId={eventId}
                bateriaId={selectedBateriaId}
              />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
