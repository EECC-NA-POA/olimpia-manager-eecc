
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { useProfileTypes, useEventProfiles } from './hooks/useProfilesData';
import { useCreateUpdateProfile, useDeleteProfile, ProfileFormValues } from './hooks/useProfileMutations';
import { ProfilesTable } from './components/ProfilesTable';
import { EmptyProfilesState } from './components/EmptyProfilesState';
import { ProfileFormDialog } from './components/ProfileFormDialog';
import { EventProfilesSectionProps, Profile } from './types';

export function EventProfilesSection({ eventId }: EventProfilesSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const { data: profileTypes = [] } = useProfileTypes();
  const { data: profiles = [], isLoading } = useEventProfiles(eventId);
  
  const createUpdateProfileMutation = useCreateUpdateProfile(eventId, editingProfile);
  const deleteProfileMutation = useDeleteProfile(eventId);

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setIsDialogOpen(true);
  };

  const handleNewProfile = () => {
    setEditingProfile(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProfile(null);
  };

  const onSubmit = (data: ProfileFormValues) => {
    createUpdateProfileMutation.mutate(data, {
      onSuccess: () => {
        handleCloseDialog();
      }
    });
  };

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

  console.log('Rendering profiles section with profiles:', profiles);
  console.log('Is loading:', isLoading);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Perfis de Usuário e Taxas de Inscrição
              </CardTitle>
              <CardDescription>
                Configure os perfis disponíveis para este evento e suas respectivas taxas de inscrição
              </CardDescription>
            </div>
            <Button onClick={handleNewProfile} className="bg-olimpics-green-primary hover:bg-olimpics-green-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Perfil
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary"></div>
            </div>
          ) : profiles.length === 0 ? (
            <EmptyProfilesState onCreateProfile={handleNewProfile} />
          ) : (
            <ProfilesTable 
              profiles={profiles}
              onEditProfile={handleEditProfile}
              onDeleteProfile={(profileId) => deleteProfileMutation.mutate(profileId)}
              isDeleting={deleteProfileMutation.isPending}
            />
          )}
        </CardContent>
      </Card>

      <ProfileFormDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        editingProfile={editingProfile}
        profileTypes={profileTypes}
        onSubmit={onSubmit}
        isSubmitting={createUpdateProfileMutation.isPending}
      />
    </div>
  );
}
