
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { Athlete } from '../hooks/useAthletes';
import { useModalityWithModelo } from '../hooks/useModalityWithModelo';
import { useDynamicBaterias } from '../hooks/useDynamicBaterias';
import { AthletesTable } from './AthletesTable';
import { DynamicScoringTableMain } from './dynamic-scoring-table/DynamicScoringTableMain';
import { BateriaNavigation } from './BateriaNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

interface AthletesListTabularProps {
  athletes: Athlete[] | undefined;
  isLoading: boolean;
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType: 'tempo' | 'distancia' | 'pontos';
}

export function AthletesListTabular({
  athletes,
  isLoading,
  modalityId,
  eventId,
  judgeId,
  scoreType
}: AthletesListTabularProps) {
  const isMobile = useIsMobile();
  
  // Get modality data with modelo configuration
  const { 
    data: modalityData, 
    modalityRule, 
    isLoading: isLoadingModalityData,
    hasModelo
  } = useModalityWithModelo(modalityId);

  // Get bateria data for this modality
  const {
    baterias,
    selectedBateriaId,
    selectedBateria,
    usesBaterias,
    isLoading: isLoadingBaterias,
    setSelectedBateriaId,
    createNewBateria,
    createFinalBateria,
    isCreating
  } = useDynamicBaterias({
    modalityId,
    eventId
  });

  console.log('=== ATHLETES LIST TABULAR DEBUG ===');
  console.log('Props received:', {
    modalityId,
    eventId,
    athletesCount: athletes?.length || 0,
    isLoading,
    athletes: athletes
  });
  console.log('Modality data:', {
    hasModelo,
    usesBaterias,
    selectedBateriaId,
    isLoadingModalityData,
    modalityData
  });
  console.log('=== END DEBUG ===');

  if (isLoading || isLoadingModalityData) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!eventId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg text-red-600">Evento não selecionado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Selecione um evento para visualizar os atletas.
          </p>
        </CardContent>
      </Card>
    );
  }

  const safeAthletes = athletes || [];
  console.log('=== SAFE ATHLETES CHECK ===');
  console.log('Athletes array:', safeAthletes);
  console.log('Athletes count:', safeAthletes.length);
  console.log('First athlete:', safeAthletes[0]);
  console.log('=== END SAFE ATHLETES CHECK ===');

  if (safeAthletes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Nenhum atleta inscrito</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Não há atletas inscritos nesta modalidade ou suas inscrições não estão confirmadas.
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800">Dica para resolução:</h4>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Verifique se há atletas inscritos na modalidade</li>
              <li>• Confirme se as inscrições estão com status "confirmado"</li>
              <li>• Verifique se a modalidade está corretamente associada ao evento</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show dynamic scoring table if modelo is configured
  if (hasModelo && modalityData?.modelo) {
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
    console.log('Athletes for dynamic table:', safeAthletes);
    console.log('Modelo formatted:', modeloFormatted);

    return (
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base sm:text-lg">
              Registro de Pontuações - Modalidade
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Mostrando {safeAthletes.length} de {safeAthletes.length} atletas
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
            athletes={safeAthletes}
            modalityId={modalityId}
            eventId={eventId}
            judgeId={judgeId}
            modelo={modeloFormatted}
            selectedBateriaId={selectedBateriaId}
          />
        </CardContent>
      </Card>
    );
  }

  console.log('=== SHOWING REGULAR ATHLETES TABLE ===');
  console.log('Athletes for regular table:', safeAthletes);

  // Fallback to regular scoring table for modalities without modelo
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base sm:text-lg">
            Lista de Atletas
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Mostrando {safeAthletes.length} de {safeAthletes.length} atletas
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <AthletesTable
          athletes={safeAthletes}
          modalityId={modalityId}
          eventId={eventId}
          judgeId={judgeId}
          scoreType={scoreType}
          modalityRule={modalityRule}
          selectedBateriaId={selectedBateriaId}
        />
      </CardContent>
    </Card>
  );
}
