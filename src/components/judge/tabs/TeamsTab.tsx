
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeamData } from './teams/hooks/useTeamData';
import { ModalitySelector } from './teams/ModalitySelector';
import { NoModalitiesCard } from './teams/NoModalitiesCard';
import { TeamCreationForm } from './teams/TeamCreationForm';
import { useTeamCreation } from './teams/hooks/useTeamCreation';
import { TeamsTabProps } from './teams/types';
import { Info } from 'lucide-react';
import { TeamCard } from '@/components/judge/team-formation/TeamCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function TeamsTab({ userId, eventId, isOrganizer = false }: TeamsTabProps) {
  const [teamName, setTeamName] = useState('');
  const {
    modalities,
    isLoadingModalities,
    selectedModalityId,
    setSelectedModalityId,
    existingTeams,
    isLoadingTeams,
    userInfo
  } = useTeamData(userId, eventId, isOrganizer);

  // Filter modalities to show only collective ones
  const collectiveModalities = modalities?.filter(mod => 
    mod.tipo_modalidade?.toLowerCase().includes('coletiv')
  ) || [];

  // Team creation functionality
  const { handleCreateTeam, createTeamMutation } = useTeamCreation(
    userId,
    eventId,
    selectedModalityId,
    userInfo?.filial_id,
    isOrganizer,
    teamName,
    setTeamName
  );

  // Handle modality selection
  const handleModalityChange = (value: string) => {
    setSelectedModalityId(Number(value));
  };

  // Get athletes for selected modality and teams
  const { data: teamsWithAthletes, isLoading: isLoadingTeamMembers } = useQuery({
    queryKey: ['team-members', selectedModalityId, eventId, existingTeams],
    queryFn: async () => {
      if (!selectedModalityId || !eventId || !existingTeams?.length) {
        return [];
      }

      const teams = [...(existingTeams || [])];
      
      for (const team of teams) {
        // Get team members for each team
        const { data: members, error: membersError } = await supabase
          .from('inscricoes_modalidades')
          .select(`
            atleta_id,
            usuarios:atleta_id(nome_completo, numero_identificador, tipo_documento, numero_documento)
          `)
          .eq('modalidade_id', selectedModalityId)
          .eq('evento_id', eventId)
          .eq('equipe_id', team.id);
        
        if (membersError) {
          console.error('Error fetching team members:', membersError);
          team.members = [];
        } else {
          team.members = members.map((member: any) => ({
            id: member.atleta_id,
            name: member.usuarios?.nome_completo || 'Atleta',
            numero_identificador: member.usuarios?.numero_identificador || '',
            documento: `${member.usuarios?.tipo_documento || 'Doc'}: ${member.usuarios?.numero_documento || ''}`
          }));
        }

        // Get team score if available
        if (team.members?.length) {
          const firstMemberId = team.members[0].id;
          const { data: score } = await supabase
            .from('pontuacoes')
            .select('*')
            .eq('evento_id', eventId)
            .eq('modalidade_id', selectedModalityId)
            .eq('atleta_id', firstMemberId)
            .maybeSingle();
          
          if (score) {
            team.score = score;
          }
        }
      }

      return teams;
    },
    enabled: !!selectedModalityId && !!eventId && !!existingTeams?.length,
  });

  if (isLoadingModalities) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!collectiveModalities || collectiveModalities.length === 0) {
    return <NoModalitiesCard isCollective={true} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Equipes</CardTitle>
          <CardDescription>
            {isOrganizer 
              ? "Gerencie as equipes formadas pelos representantes de delegação" 
              : "Monte as equipes para as modalidades coletivas"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <ModalitySelector 
              modalities={collectiveModalities}
              onModalityChange={handleModalityChange}
            />
            
            {selectedModalityId && (
              <>
                {/* Team creation form for delegation representatives */}
                {!isOrganizer && (
                  <div className="pt-4">
                    <TeamCreationForm
                      teamName={teamName}
                      onTeamNameChange={setTeamName}
                      onCreateTeam={handleCreateTeam}
                      isCreating={createTeamMutation.isPending}
                    />
                  </div>
                )}
                
                {/* Information message for judges */}
                {isOrganizer && (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-amber-50 border border-amber-200 text-amber-800">
                    <Info size={16} />
                    <p className="text-sm">As equipes são formadas pelos representantes de delegação e não podem ser editadas.</p>
                  </div>
                )}
                
                {isLoadingTeams || isLoadingTeamMembers ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : teamsWithAthletes && teamsWithAthletes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamsWithAthletes.map(team => (
                      <Card key={team.id} className="border overflow-hidden">
                        <CardHeader className="bg-slate-50">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">{team.nome}</CardTitle>
                            {team.score && (
                              <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                                {team.score.tipo_pontuacao === 'time' ? 
                                  `${team.score.tempo_minutos || 0}m ${team.score.tempo_segundos || 0}s` : 
                                  `${team.score.valor_pontuacao || 0} pts`
                                }
                              </div>
                            )}
                          </div>
                          {team.cor_uniforme && (
                            <CardDescription>
                              Uniforme: {team.cor_uniforme}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <h4 className="font-medium text-sm mb-2">Membros da equipe ({team.members?.length || 0})</h4>
                          <ul className="space-y-2">
                            {team.members?.map((member: any) => (
                              <li key={member.id} className="text-sm border-b pb-1">
                                <div className="font-medium">{member.name}</div>
                                <div className="text-xs text-muted-foreground">{member.documento}</div>
                                {member.numero_identificador && (
                                  <div className="text-xs text-muted-foreground">ID: {member.numero_identificador}</div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Nenhuma equipe disponível para esta modalidade
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
