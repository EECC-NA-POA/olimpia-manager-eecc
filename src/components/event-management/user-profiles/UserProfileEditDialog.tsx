import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { UserProfileDataAlternative } from '@/lib/api/profiles/fetchUserProfilesAlternative';
import { updateUserProfiles } from '@/lib/api/profiles/updateUserProfiles';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Save } from 'lucide-react';

interface Profile {
  id: number;
  nome: string;
  evento_id: string;
}

interface UserProfileEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfileDataAlternative | null;
  eventId: string;
}

export function UserProfileEditDialog({ isOpen, onClose, user, eventId }: UserProfileEditDialogProps) {
  const [selectedProfiles, setSelectedProfiles] = useState<number[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch available profiles for the event
  const { data: availableProfiles = [], isLoading: isLoadingProfiles } = useQuery<Profile[]>({
    queryKey: ['profiles', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('evento_id', eventId)
        .order('nome');
      
      if (error) throw error;
      return data || [];
    },
    enabled: isOpen && !!eventId
  });

  // Initialize selected profiles when user changes
  useEffect(() => {
    if (user && user.profiles) {
      setSelectedProfiles(user.profiles.map(p => p.id));
    }
  }, [user]);

  const handleProfileToggle = (profileId: number) => {
    setSelectedProfiles(current =>
      current.includes(profileId)
        ? current.filter(id => id !== profileId)
        : [...current, profileId]
    );
  };

  const handleSave = async () => {
    if (!user) return;

    if (selectedProfiles.length === 0) {
      toast.error("O usuário deve ter pelo menos um perfil atribuído");
      return;
    }

    setIsUpdating(true);
    
    try {
      // Temporarily store current event ID and set it for the update
      const currentEventId = localStorage.getItem('currentEventId');
      localStorage.setItem('currentEventId', eventId);
      
      await updateUserProfiles(user.id, selectedProfiles);
      
      // Restore original event ID
      if (currentEventId) {
        localStorage.setItem('currentEventId', currentEventId);
      }
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['user-profiles-alternative'] });
      
      toast.success("Perfis atualizados com sucesso!");
      onClose();
    } catch (error: any) {
      console.error('Error updating profiles:', error);
      toast.error(error.message || "Erro ao atualizar perfis");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Editar Perfis - {user.nome_completo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoadingProfiles ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Carregando perfis...</span>
            </div>
          ) : availableProfiles.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nenhum perfil disponível para este evento.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Selecione os perfis que este usuário deve ter:
              </p>
              
              {availableProfiles.map((profile) => (
                <div key={profile.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`profile-${profile.id}`}
                    checked={selectedProfiles.includes(profile.id)}
                    onCheckedChange={() => handleProfileToggle(profile.id)}
                  />
                  <label
                    htmlFor={`profile-${profile.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {profile.nome}
                  </label>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isUpdating}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isUpdating || selectedProfiles.length === 0}
              className="bg-olimpics-green-primary hover:bg-olimpics-green-primary/90"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}