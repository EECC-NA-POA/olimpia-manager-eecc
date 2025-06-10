
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Table } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { AthletesList } from './scores/components/AthletesList';
import { AthletesListTabular } from './scores/components/AthletesListTabular';
import { useAthletes } from './scores/hooks/useAthletes';
import { useModalityWithModelo } from './scores/hooks/useModalityWithModelo';

interface ScoresTabProps {
  userId: string;
  eventId: string | null;
}

export function ScoresTab({ userId, eventId }: ScoresTabProps) {
  const [selectedModalityId, setSelectedModalityId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Fetch available modalities for this event
  const { data: modalities, isLoading: isLoadingModalities } = useQuery({
    queryKey: ['judge-modalities', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, categoria, tipo_pontuacao, tipo_modalidade')
        .eq('evento_id', eventId)
        .order('nome');
      
      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  // Get modality data with modelo configuration
  const { 
    data: modalityData, 
    modalityRule, 
    isLoading: isLoadingModalityData,
    hasModelo,
    campos 
  } = useModalityWithModelo(selectedModalityId);

  // Fetch athletes for selected modality
  const { 
    data: athletes, 
    isLoading: isLoadingAthletes 
  } = useAthletes(selectedModalityId, eventId);

  // Auto-select first modality if none selected
  React.useEffect(() => {
    if (modalities && modalities.length > 0 && !selectedModalityId) {
      setSelectedModalityId(modalities[0].id);
    }
  }, [modalities, selectedModalityId]);

  const currentModality = modalityData?.modality;
  const scoreType = currentModality?.tipo_pontuacao || 'pontos';
  
  // Map Portuguese score types to English for components
  const mapScoreType = (type: string): 'tempo' | 'distancia' | 'pontos' => {
    switch (type) {
      case 'tempo': return 'tempo';
      case 'distancia': return 'distancia';
      case 'pontos':
      default: return 'pontos';
    }
  };

  const mappedScoreType = mapScoreType(scoreType);

  if (isLoadingModalities) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!modalities || modalities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhuma modalidade encontrada</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Não há modalidades cadastradas para este evento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modality Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Modalidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select
                value={selectedModalityId?.toString() || ''}
                onValueChange={(value) => setSelectedModalityId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma modalidade" />
                </SelectTrigger>
                <SelectContent>
                  {modalities.map((modality) => (
                    <SelectItem key={modality.id} value={modality.id.toString()}>
                      {modality.nome}
                      {modality.categoria && ` - ${modality.categoria}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Grade
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <Table className="h-4 w-4 mr-2" />
                Tabela
              </Button>
            </div>
          </div>

          {/* Show modality information */}
          {currentModality && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Modalidade:</span> {currentModality.nome}
                </div>
                <div>
                  <span className="font-medium">Tipo:</span> {currentModality.tipo_modalidade || 'Individual'}
                </div>
                <div>
                  <span className="font-medium">Pontuação:</span> {scoreType}
                </div>
              </div>
              
              {hasModelo && modalityData?.modelo && (
                <div className="mt-3 pt-3 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-700">Modelo Configurado:</span> {modalityData.modelo.descricao || modalityData.modelo.codigo_modelo}
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Campos:</span> {campos.length} campo(s) configurado(s)
                    </div>
                  </div>
                  {modalityRule && (
                    <div className="mt-2 text-xs text-green-600">
                      Regra: {modalityRule.regra_tipo}
                      {modalityRule.parametros.baterias && ' | Usa Baterias'}
                      {modalityRule.parametros.num_raias && ` | ${modalityRule.parametros.num_raias} raias`}
                    </div>
                  )}
                </div>
              )}
              
              {!hasModelo && (
                <div className="mt-3 pt-3 border-t">
                  <div className="text-sm text-amber-600">
                    ⚠️ Nenhum modelo de pontuação configurado para esta modalidade
                  </div>
                  <div className="text-xs text-amber-500 mt-1">
                    Configure um modelo na seção "Configuração de Modelos de Pontuação" do evento
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Athletes List */}
      {selectedModalityId && (
        isLoadingModalityData || isLoadingAthletes ? (
          <Card>
            <CardContent className="py-8">
              <div className="flex items-center justify-center">
                <Skeleton className="h-8 w-48" />
              </div>
            </CardContent>
          </Card>
        ) : (
          viewMode === 'grid' ? (
            <AthletesList
              athletes={athletes}
              isLoading={isLoadingAthletes}
              modalityId={selectedModalityId}
              eventId={eventId}
              judgeId={userId}
              scoreType={mappedScoreType}
              modalityRule={modalityRule}
            />
          ) : (
            <AthletesListTabular
              athletes={athletes}
              isLoading={isLoadingAthletes}
              modalityId={selectedModalityId}
              eventId={eventId}
              judgeId={userId}
              scoreType={mappedScoreType}
            />
          )
        )
      )}
    </div>
  );
}
