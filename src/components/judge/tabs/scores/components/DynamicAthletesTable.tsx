
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calculator, ChevronDown, ChevronUp, Table as TableIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalculatedFieldsManager } from '@/components/judge/calculated-fields';
import { DynamicScoringTable } from './DynamicScoringTable';
import { Athlete } from '../hooks/useAthletes';

interface DynamicAthletesTableProps {
  athletes: Athlete[];
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  modelo: any;
  selectedBateriaId?: number | null;
}

export function DynamicAthletesTable({
  athletes,
  modalityId,
  eventId,
  judgeId,
  modelo,
  selectedBateriaId
}: DynamicAthletesTableProps) {
  const [showCalculatedFields, setShowCalculatedFields] = useState(false);

  if (!eventId) {
    return <div>Evento não selecionado</div>;
  }

  return (
    <div className="space-y-6">
      {/* Athletes scoring section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TableIcon className="h-5 w-5" />
            Registro de Pontuações
            {selectedBateriaId && (
              <span className="text-sm text-muted-foreground">
                - Bateria {selectedBateriaId === 999 ? 'Final' : selectedBateriaId}
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
