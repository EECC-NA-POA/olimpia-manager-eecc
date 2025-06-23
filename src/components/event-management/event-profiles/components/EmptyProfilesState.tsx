
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';

interface EmptyProfilesStateProps {
  onCreateProfile: () => void;
}

export function EmptyProfilesState({ onCreateProfile }: EmptyProfilesStateProps) {
  return (
    <div className="text-center py-8">
      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground">Nenhum perfil cadastrado para este evento.</p>
      <Button 
        onClick={onCreateProfile} 
        className="mt-4 bg-olimpics-green-primary hover:bg-olimpics-green-primary/90"
      >
        <Plus className="h-4 w-4 mr-2" />
        Criar Primeiro Perfil
      </Button>
    </div>
  );
}
