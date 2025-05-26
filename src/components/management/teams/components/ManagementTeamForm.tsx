
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ManagementTeamFormProps {
  modalityId: number;
  modalityName: string;
  onCreateTeam: (name: string) => void;
  isCreating: boolean;
  isOrganizer: boolean;
}

export function ManagementTeamForm({ 
  modalityId, 
  modalityName, 
  onCreateTeam, 
  isCreating, 
  isOrganizer 
}: ManagementTeamFormProps) {
  const [teamName, setTeamName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim()) {
      onCreateTeam(teamName.trim());
      setTeamName('');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Criar Nova Equipe - {modalityName}</h3>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Nome da equipe"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            disabled={isCreating}
          />
        </div>
        <Button type="submit" disabled={!teamName.trim() || isCreating}>
          {isCreating ? 'Criando...' : 'Criar Equipe'}
        </Button>
      </form>
    </div>
  );
}
