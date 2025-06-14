
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Athlete } from '../../hooks/useAthletes';
import { BateriaNavigation } from '../BateriaNavigation';
import { DynamicScoringTableMain } from '../dynamic-scoring-table/DynamicScoringTableMain';

interface DynamicScoringCardProps {
  athletes: Athlete[];
  modalityId: number;
  eventId: string;
  judgeId: string;
  modalityData: any;
  campos: any[];
  usesBaterias: boolean;
  baterias: any[];
  selectedBateriaId: number | null;
  selectedBateria: any;
  isLoadingBaterias: boolean;
  isCreating: boolean;
  existingScores: any[];
  setSelectedBateriaId: (id: number | null) => void;
  createNewBateria: () => void;
  createFinalBateria: () => void;
  refetchScores: () => Promise<any>;
}

export function DynamicScoringCard({
  athletes,
  modalityId,
  eventId,
  judgeId,
  modalityData,
  campos,
  usesBaterias,
  baterias,
  selectedBateriaId,
  selectedBateria,
  isLoadingBaterias,
  isCreating,
  existingScores,
  setSelectedBateriaId,
  createNewBateria,
  createFinalBateria,
  refetchScores
}: DynamicScoringCardProps) {
  // Create a properly typed modelo object
  const modeloFormatted = {
    id: modalityData.modelo.id,
    modalidade_id: modalityId,
    codigo_modelo: modalityData.modelo.codigo_modelo,
    descricao: modalityData.modelo.descricao,
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
    campos_modelo: modalityData.modelo.campos_modelo || []
  };

  console.log('=== SHOWING DYNAMIC SCORING TABLE ===');
  console.log('Athletes for dynamic table:', athletes);
  console.log('Modelo formatted:', modeloFormatted);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base sm:text-lg">
            Registro de Pontuações - Modalidade
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Mostrando {athletes.length} de {athletes.length} atletas
          </div>
        </div>
        
        {/* Sistema de Pontuação Dinâmica Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
          <div className="text-green-800 text-sm font-medium">
            ✓ Sistema de Pontuação Dinâmica Ativo
          </div>
          <div className="text-green-700 text-xs mt-1">
            Modelo: {modalityData.modelo.descricao || modalityData.modelo.codigo_modelo}
          </div>
          {usesBaterias && (
            <div className="text-green-700 text-xs">
              Sistema de baterias: {usesBaterias ? 'Ativo' : 'Inativo'}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Bateria Navigation - only show if using baterias */}
        {usesBaterias && (
          <BateriaNavigation
            baterias={baterias}
            selectedBateriaId={selectedBateriaId}
            onSelectBateria={setSelectedBateriaId}
            onCreateBateria={createNewBateria}
            onCreateFinalBateria={createFinalBateria}
            isCreating={isCreating}
            isLoading={isLoadingBaterias}
          />
        )}
        
        {/* Dynamic Scoring Table */}
        <DynamicScoringTableMain
          athletes={athletes}
          modalityId={modalityId}
          eventId={eventId}
          judgeId={judgeId}
          modelo={modeloFormatted}
          campos={campos}
          selectedBateriaId={selectedBateriaId}
          existingScores={existingScores}
          refetchScores={refetchScores}
        />
      </CardContent>
    </Card>
  );
}
