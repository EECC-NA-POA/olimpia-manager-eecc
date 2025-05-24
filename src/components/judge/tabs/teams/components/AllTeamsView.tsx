
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin } from 'lucide-react';
import { TeamData } from '../types';
import { TeamFormation } from '../../../TeamFormation';
import { useAvailableAthletes } from '../hooks/useAvailableAthletes';

interface AllTeamsViewProps {
  teams: TeamData[];
  isLoading: boolean;
  isOrganizer?: boolean;
  eventId: string | null;
  modalityFilter: number | null;
}

export function AllTeamsView({ 
  teams, 
  isLoading, 
  isOrganizer = false, 
  eventId, 
  modalityFilter 
}: AllTeamsViewProps) {
  // Get available athletes for organizers when a modality is selected
  const { data: availableAthletes } = useAvailableAthletes(
    eventId, 
    modalityFilter, 
    isOrganizer && modalityFilter ? true : false,
    null // No branch filter for organizers
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            Nenhuma equipe encontrada com os filtros aplicados.
          </p>
        </CardContent>
      </Card>
    );
  }

  // If organizer and modality selected, show TeamFormation for editing
  if (isOrganizer && modalityFilter) {
    // Convert TeamData to Team format expected by TeamFormation
    const formattedTeams = teams.map(team => {
      // Parse the document string to extract tipo_documento and numero_documento
      const parseDocument = (documento: string) => {
        const parts = documento.split(': ');
        return {
          tipo_documento: parts[0] || '',
          numero_documento: parts[1] || ''
        };
      };

      return {
        id: team.id,
        nome: team.nome,
        modalidade_id: team.modalidade_id,
        filial_id: team.filial_id,
        evento_id: team.evento_id,
        modalidades: team.modalidade_info ? {
          nome: team.modalidade_info.nome,
          categoria: team.modalidade_info.categoria
        } : undefined,
        athletes: team.atletas?.map(atleta => {
          const { tipo_documento, numero_documento } = parseDocument(atleta.documento);
          return {
            id: atleta.id,
            atleta_id: atleta.atleta_id,
            atleta_nome: atleta.atleta_nome,
            posicao: atleta.posicao,
            raia: atleta.raia || 0,
            tipo_documento,
            numero_documento
          };
        }) || []
      };
    });

    const formattedAvailableAthletes = availableAthletes?.map(athlete => ({
      id: athlete.id,
      nome: athlete.nome,
      documento: athlete.documento,
      filial_nome: athlete.filial_nome || 'N/A'
    })) || [];

    return (
      <TeamFormation
        teams={formattedTeams}
        availableAthletes={formattedAvailableAthletes}
        eventId={eventId}
        modalityId={modalityFilter}
        isOrganizer={isOrganizer}
        isReadOnly={false}
        branchId={null}
      />
    );
  }

  // Default view for non-organizers or when no modality is selected
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {teams.map((team) => (
        <Card key={team.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">{team.nome}</CardTitle>
              <Badge variant="secondary" className="ml-2">
                {team.atletas.length} atletas
              </Badge>
            </div>
            {team.modalidade_info && (
              <div className="text-sm text-muted-foreground">
                {team.modalidade_info.nome} - {team.modalidade_info.categoria}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Athletes Grid */}
            {team.atletas.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Atletas
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {team.atletas.slice(0, 3).map((athlete) => (
                    <div key={athlete.id} className="bg-gray-50 p-2 rounded text-sm">
                      <div className="font-medium">{athlete.atleta_nome}</div>
                      {athlete.filial_nome && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {athlete.filial_nome}
                        </div>
                      )}
                    </div>
                  ))}
                  {team.atletas.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      +{team.atletas.length - 3} atletas
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                Nenhum atleta adicionado
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
