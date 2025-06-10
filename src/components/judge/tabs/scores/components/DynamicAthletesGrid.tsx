
import React from 'react';
import { AthleteCard } from '@/components/judge/AthleteCard';
import { DynamicAthleteScoreCard } from '@/components/judge/score-card/DynamicAthleteScoreCard';
import { useModelosModalidade } from '@/hooks/useDynamicScoring';
import { Athlete } from '../hooks/useAthletes';

interface DynamicAthletesGridProps {
  athletes: Athlete[];
  selectedAthleteId: string | null;
  onAthleteSelect: (athleteId: string | null) => void;
  modalityId: number;
  scoreType: 'tempo' | 'distancia' | 'pontos';
  eventId: string | null;
  judgeId: string;
  modalityRule?: any;
}

export function DynamicAthletesGrid({
  athletes,
  selectedAthleteId,
  onAthleteSelect,
  modalityId,
  scoreType,
  eventId,
  judgeId,
  modalityRule
}: DynamicAthletesGridProps) {
  // Check for dynamic scoring
  const { data: modelos = [] } = useModelosModalidade(modalityId);
  const hasDynamicScoring = modelos.length > 0;

  console.log('DynamicAthletesGrid - Debug info:', {
    modalityId,
    hasDynamicScoring,
    modelosCount: modelos.length,
    modalityRule: modalityRule?.regra_tipo,
    athletesCount: athletes.length
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {athletes.map((athlete) => (
        <div key={athlete.atleta_id} className="space-y-2">
          {/* Show dynamic scoring card if configured, otherwise show legacy card */}
          {hasDynamicScoring ? (
            <div className="space-y-2">
              {/* Basic athlete info */}
              <div className="bg-card border rounded-lg p-4">
                <div className="font-medium">{athlete.atleta_nome}</div>
                <div className="text-sm text-muted-foreground">
                  {athlete.equipe_nome || athlete.filial_nome}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {athlete.origem_uf && `${athlete.origem_uf} • `}
                  {athlete.origem_cidade || athlete.filial_nome}
                </div>
              </div>
              
              {/* Dynamic scoring component */}
              <DynamicAthleteScoreCard
                athlete={athlete}
                modalityId={modalityId}
                eventId={eventId}
                judgeId={judgeId}
                scoreType={scoreType}
              />
            </div>
          ) : (
            /* Legacy scoring card */
            <AthleteCard
              athlete={athlete}
              modalityId={modalityId}
              eventId={eventId}
              judgeId={judgeId}
              scoreType={scoreType}
              modalityRule={modalityRule}
              isSelected={selectedAthleteId === athlete.atleta_id}
              onSelect={() => onAthleteSelect(
                selectedAthleteId === athlete.atleta_id ? null : athlete.atleta_id
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
