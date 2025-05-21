
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TeamCreationFormProps {
  teamName: string;
  onTeamNameChange: (value: string) => void;
  onCreateTeam: () => void;
  isCreating: boolean;
}

export function TeamCreationForm({ 
  teamName, 
  onTeamNameChange, 
  onCreateTeam, 
  isCreating 
}: TeamCreationFormProps) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <label className="text-sm font-medium">Nova Equipe</label>
        <Input 
          placeholder="Nome da equipe" 
          value={teamName}
          onChange={(e) => onTeamNameChange(e.target.value)}
        />
      </div>
      <Button 
        onClick={onCreateTeam}
        disabled={isCreating}
      >
        {isCreating ? 'Criando...' : 'Criar Equipe'}
      </Button>
    </div>
  );
}
