import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Phone, UserX, Plus, Building2 } from "lucide-react";
import { OrganizerModalityWithRepresentatives } from '@/lib/api/representatives';

interface OrganizerModalityCardProps {
  modality: OrganizerModalityWithRepresentatives;
  availableAthletes: any[] | undefined;
  athletesLoading: boolean;
  selectedModalityForChange: number | null;
  onSetSelectedModality: (modalityId: number) => void;
  onAddRepresentative: (modalityId: number, atletaId: string) => void;
  onRemoveRepresentative: (modalityId: number, atletaId: string) => void;
  onCancelSelection: () => void;
}

export function OrganizerModalityCard({
  modality,
  availableAthletes,
  athletesLoading,
  selectedModalityForChange,
  onSetSelectedModality,
  onAddRepresentative,
  onRemoveRepresentative,
  onCancelSelection
}: OrganizerModalityCardProps) {
  // Safely access representatives array with fallback to empty array
  const representatives = modality.representatives || [];
  
  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-olimpics-green-primary" />
              <span className="text-sm">{modality.nome}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Building2 className="h-3 w-3" />
              {modality.filial_nome}
            </div>
          </div>
          {representatives.length > 0 ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {representatives.length} Rep{representatives.length > 1 ? 's' : ''}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              Sem Rep
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {representatives.length > 0 ? (
          <div className="space-y-3">
            {representatives.map((representative, index) => (
              <div key={`${representative.atleta_id}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium text-foreground text-sm">
                    {representative.nome_completo}
                  </h4>
                  <div className="flex flex-col gap-1 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{representative.email}</span>
                    </div>
                    {representative.telefone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {representative.telefone}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemoveRepresentative(modality.id, representative.atleta_id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <UserX className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetSelectedModality(modality.id)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Representante
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 border-2 border-dashed border-gray-300 rounded-lg">
            <span className="text-gray-500 text-sm">Nenhum representante definido</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetSelectedModality(modality.id)}
            >
              Definir Rep
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
                  onValueChange={(atletaId) => onAddRepresentative(modality.id, atletaId)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um atleta inscrito nesta modalidade" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                    {availableAthletes
                      .filter(athlete => !representatives.some(rep => rep.atleta_id === athlete.id))
                      .map((athlete) => (
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
                  onClick={onCancelSelection}
                  className="w-full"
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>Nenhum atleta disponível para esta modalidade.</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancelSelection}
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
  );
}