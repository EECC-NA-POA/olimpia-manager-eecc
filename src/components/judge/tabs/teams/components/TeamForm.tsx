
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TeamFormProps {
  onCreateTeam: (name: string) => void;
  isCreating: boolean;
}

export function TeamForm({ onCreateTeam, isCreating }: TeamFormProps) {
  const [teamName, setTeamName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim()) {
      onCreateTeam(teamName.trim());
      setTeamName('');
    }
  };

  return (
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
  );
}
