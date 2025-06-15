
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AthletesListTabular } from './scores/components/AthletesListTabular';
import { useAthletes } from './scores/hooks/useAthletes';
import { useModalityWithModelo } from './scores/hooks/useModalityWithModelo';
import { useIsMobile } from '@/hooks/use-mobile';

interface ScoresTabProps {
  userId: string;
  eventId: string | null;
}

export function ScoresTab({ userId, eventId }: ScoresTabProps) {
  const [selectedModalityId, setSelectedModalityId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  // Fetch available modalities for this event
  const { data: modalities, isLoading: isLoadingModalities } = useQuery({
    queryKey: ['judge-modalities', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, categoria, tipo_pontuacao, tipo_modalidade')
        .eq('evento_id', eventId)
        .order('categoria')
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

  // Group modalities by category and filter by search
  const groupedModalities = React.useMemo(() => {
    if (!modalities) return {};
    
    const filtered = modalities.filter(modality =>
      modality.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (modality.categoria || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filtered.reduce((groups, modality) => {
      const category = modality.categoria || 'Sem categoria';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(modality);
      return groups;
    }, {} as Record<string, typeof modalities>);
  }, [modalities, searchTerm]);

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
        <Skeleton className="h-8 sm:h-12 w-full" />
        <Skeleton className="h-48 sm:h-64 w-full" />
      </div>
    );
  }

  if (!modalities || modalities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Nenhuma modalidade encontrada</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Não há modalidades cadastradas para este evento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Modality Selection */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base sm:text-lg">Selecionar Modalidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar modalidade..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Grouped Modalities in Columns Layout */}
          <div className={`grid gap-4 max-h-96 overflow-y-auto ${
            isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'
          }`}>
            {Object.entries(groupedModalities).map(([category, modalitiesInCategory]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2 border-b pb-2">
                  <h4 className="font-medium text-sm text-primary">{category}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {modalitiesInCategory.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {modalitiesInCategory.map((modality) => (
                    <button
                      key={modality.id}
                      onClick={() => setSelectedModalityId(modality.id)}
                      className={`w-full p-3 rounded-lg border text-left transition-all duration-200 ${
                        selectedModalityId === modality.id
                          ? 'bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]'
                          : 'bg-card hover:bg-accent border-border hover:border-primary/50 hover:scale-[1.01]'
                      }`}
                    >
                      <div className="font-medium text-sm">{modality.nome}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {modality.tipo_pontuacao === 'tempo' ? 'Tempo' : 
                         modality.tipo_pontuacao === 'distancia' ? 'Distância' : 'Pontos'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Show modality information */}
          {currentModality && (
            <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-2 border-t mt-4">
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-2 sm:gap-4 text-xs sm:text-sm`}>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium">Modalidade:</span> 
                  <span className="sm:ml-2">{currentModality.nome}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium">Tipo:</span> 
                  <span className="sm:ml-2">{currentModality.tipo_modalidade || 'Individual'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium">Pontuação:</span> 
                  <span className="sm:ml-2">{scoreType}</span>
                </div>
              </div>
              
              {hasModelo && modalityData?.modelo && (
                <div className="mt-3 pt-3 border-t">
                  <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-2 sm:gap-4 text-xs sm:text-sm`}>
                    <div>
                      <span className="font-medium text-green-700">Modelo:</span> 
                      <span className="ml-2">{modalityData.modelo.descricao || modalityData.modelo.codigo_modelo}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Campos:</span> 
                      <span className="ml-2">{campos.length} campo(s) configurado(s)</span>
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
                  <div className="text-xs sm:text-sm text-amber-600">
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
          <AthletesListTabular
            modalityId={selectedModalityId}
            eventId={eventId}
            judgeId={userId}
            scoreType={mappedScoreType}
          />
        )
      )}
    </div>
  );
}
