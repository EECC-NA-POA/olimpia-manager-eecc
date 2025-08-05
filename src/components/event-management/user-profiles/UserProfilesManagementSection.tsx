import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, AlertCircle, Loader2 } from 'lucide-react';
import { useUserProfilesAlternative } from '@/hooks/useUserProfilesAlternative';
import { UserProfilesTable } from './UserProfilesTable';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserProfilesManagementSectionProps {
  eventId: string;
}

export function UserProfilesManagementSection({ eventId }: UserProfilesManagementSectionProps) {
  console.log('=== UserProfilesManagementSection renderizando com eventId:', eventId);
  
  const { data: userProfiles = [], isLoading, error } = useUserProfilesAlternative(eventId);

  console.log('UserProfiles data:', userProfiles);
  console.log('IsLoading:', isLoading);
  console.log('Error:', error);

  if (!eventId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Nenhum evento selecionado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gerenciar Perfis de Usuários
              </CardTitle>
              <CardDescription>
                Visualize e gerencie os perfis atribuídos aos usuários inscritos neste evento
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
              <span className="ml-2 text-muted-foreground">Carregando usuários...</span>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao carregar usuários: {error.message}
              </AlertDescription>
            </Alert>
          ) : userProfiles.length === 0 ? (
            <div className="text-center p-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
              <p className="text-muted-foreground">
                Não há usuários inscritos neste evento ainda.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>{userProfiles.length}</strong> usuário(s) encontrado(s) neste evento
                </p>
              </div>
              
              <UserProfilesTable 
                userProfiles={userProfiles}
                eventId={eventId}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}