
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Phone, UserX } from "lucide-react";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";
import {
  useModalitiesWithRepresentatives,
  useRegisteredAthletes,
  useRepresentativeMutations
} from "@/hooks/useModalityRepresentatives";

interface RepresentativesTabProps {
  filialId: string;
  eventId: string;
}

export function RepresentativesTab({ filialId, eventId }: RepresentativesTabProps) {
  const [selectedModalityForChange, setSelectedModalityForChange] = useState<number | null>(null);
  
  const {
    data: modalities,
    isLoading,
    error,
    refetch
  } = useModalitiesWithRepresentatives(filialId, eventId);

  const {
    data: availableAthletes,
    isLoading: athletesLoading
  } = useRegisteredAthletes(filialId, selectedModalityForChange, eventId);

  const { setRepresentative, removeRepresentative } = useRepresentativeMutations(filialId, eventId);

  const handleSetRepresentative = (modalityId: number, atletaId: string) => {
    setRepresentative.mutate({ modalityId, atletaId });
    setSelectedModalityForChange(null);
  };

  const handleRemoveRepresentative = (modalityId: number) => {
    removeRepresentative.mutate(modalityId);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
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

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-olimpics-text mb-2">
          Gestão de Representantes por Modalidade
        </h2>
        <p className="text-gray-600">
          Defina um atleta representante para cada modalidade da sua filial. 
          Apenas atletas inscritos e confirmados na modalidade podem ser selecionados como representantes.
        </p>
      </div>

      <div className="grid gap-4">
        {modalities.map((modality) => (
          <Card key={modality.id} className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-olimpics-green-primary" />
                  {modality.nome}
                </div>
                {modality.representative ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Representante Definido
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    Sem Representante
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {modality.representative ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium text-gray-900">
                        {modality.representative.nome_completo}
                      </h4>
                      <div className="flex flex-col gap-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {modality.representative.email}
                        </div>
                        {modality.representative.telefone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {modality.representative.telefone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedModalityForChange(modality.id)}
                      >
                        Alterar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveRepresentative(modality.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 border-2 border-dashed border-gray-300 rounded-lg">
                  <span className="text-gray-500">Nenhum representante definido para esta modalidade</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedModalityForChange(modality.id)}
                  >
                    Definir Representante
                  </Button>
                </div>
              )}

              {selectedModalityForChange === modality.id && (
                <div className="mt-4 p-4 border border-olimpics-green-primary/20 rounded-lg bg-olimpics-green-primary/5">
                  <h5 className="font-medium mb-3">Selecionar Representante:</h5>
                  {athletesLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-olimpics-green-primary mx-auto" />
                    </div>
                  ) : availableAthletes && availableAthletes.length > 0 ? (
                    <div className="space-y-2">
                      <Select
                        onValueChange={(atletaId) => handleSetRepresentative(modality.id, atletaId)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha um atleta inscrito nesta modalidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableAthletes.map((athlete) => (
                            <SelectItem key={athlete.id} value={athlete.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{athlete.nome_completo}</span>
                                <span className="text-sm text-gray-500">{athlete.email}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedModalityForChange(null)}
                        className="w-full"
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p>Nenhum atleta inscrito nesta modalidade encontrado.</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedModalityForChange(null)}
                        className="mt-2"
                      >
                        Fechar
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
