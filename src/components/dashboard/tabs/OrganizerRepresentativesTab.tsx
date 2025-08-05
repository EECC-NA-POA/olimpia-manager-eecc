import React from 'react';
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";
import { useAllModalitiesWithRepresentatives } from "@/hooks/useModalityRepresentatives";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Trophy } from "lucide-react";

interface OrganizerRepresentativesTabProps {
  eventId: string;
}

export function OrganizerRepresentativesTab({ eventId }: OrganizerRepresentativesTabProps) {
  const {
    data: modalities,
    isLoading,
    error,
    refetch
  } = useAllModalitiesWithRepresentatives(eventId);

  console.log('OrganizerRepresentativesTab data:', modalities);

  if (!eventId) {
    return (
      <EmptyState
        title="Dados insuficientes"
        description="Não foi possível carregar os representantes. Evento não identificado."
      />
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    console.error('Error loading modalities for organizer:', error);
    return <ErrorState onRetry={refetch} />;
  }

  if (!modalities || modalities.length === 0) {
    return (
      <EmptyState
        title="Nenhuma modalidade encontrada"
        description="Não há modalidades ativas para este evento"
      />
    );
  }

  // Group modalities by filial and then by category
  const groupedData = modalities.reduce((acc, modality) => {
    const filialKey = modality.filial_id || 'sem-filial';
    const filialName = modality.filial_nome || 'Sem filial';
    
    if (!acc[filialKey]) {
      acc[filialKey] = {
        filial_nome: filialName,
        categories: {}
      };
    }
    
    const category = modality.categoria || 'Sem categoria';
    if (!acc[filialKey].categories[category]) {
      acc[filialKey].categories[category] = [];
    }
    
    acc[filialKey].categories[category].push(modality);
    return acc;
  }, {} as Record<string, { filial_nome: string; categories: Record<string, typeof modalities> }>);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-olimpics-text mb-2">
          Visão Geral de Representantes por Filial
        </h2>
        <p className="text-gray-600">
          Visualize todos os representantes designados para as modalidades de cada filial neste evento.
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedData).map(([filialId, filialData]) => (
          <Card key={filialId} className="border-l-4 border-l-olimpics-green-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-olimpics-text">
                <Building2 className="h-5 w-5" />
                {filialData.filial_nome}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(filialData.categories).map(([category, categoryModalities]) => (
                  <div key={category} className="space-y-3">
                    <h4 className="font-semibold text-olimpics-text flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      {category}
                    </h4>
                    
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {categoryModalities.map((modality) => (
                        <Card key={`${modality.id}-${filialId}`} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <h5 className="font-medium text-sm text-olimpics-text line-clamp-2">
                                  {modality.nome}
                                </h5>
                                <Badge 
                                  variant={modality.representatives.length > 0 ? "default" : "secondary"}
                                  className="text-xs shrink-0 ml-2"
                                >
                                  {modality.representatives.length} rep.
                                </Badge>
                              </div>
                              
                              {modality.representatives.length > 0 ? (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <Users className="h-3 w-3" />
                                    Representantes:
                                  </div>
                                  <div className="space-y-1">
                                    {modality.representatives.map((rep, index) => (
                                      <div key={`${rep.atleta_id}-${index}`} className="text-xs p-2 bg-gray-50 rounded">
                                        <div className="font-medium text-olimpics-text">{rep.nome_completo}</div>
                                        {rep.email && (
                                          <div className="text-gray-600 truncate">{rep.email}</div>
                                        )}
                                        {rep.telefone && (
                                          <div className="text-gray-600">{rep.telefone}</div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-500 italic flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  Nenhum representante designado
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}