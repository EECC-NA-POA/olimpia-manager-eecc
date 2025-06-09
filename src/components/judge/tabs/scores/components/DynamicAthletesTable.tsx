import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScoreEntryRow } from './ScoreEntryRow';
import { CalculatedFieldsManager } from '@/components/judge/calculated-fields';
import { useModelosModalidade } from '@/hooks/useDynamicScoring';
import { Athlete } from '../hooks/useAthletes';

interface DynamicAthletesTableProps {
  athletes: Athlete[];
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  modelo: any;
}

export function DynamicAthletesTable({
  athletes,
  modalityId,
  eventId,
  judgeId,
  modelo
}: DynamicAthletesTableProps) {
  const [showCalculatedFields, setShowCalculatedFields] = useState(false);

  if (!eventId) {
    return <div>Evento não selecionado</div>;
  }

  return (
    <div className="space-y-6">
      {/* Athletes scoring table */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Pontuações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {athletes.map((athlete) => (
              <ScoreEntryRow
                key={athlete.id}
                athlete={athlete}
                modalityId={modalityId}
                eventId={eventId}
                judgeId={judgeId}
                modelo={modelo}
              />
            ))}
          </div>
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
              />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
