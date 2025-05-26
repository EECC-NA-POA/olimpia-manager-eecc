
import React from 'react';
import { Users } from 'lucide-react';

interface ManagementTeamsTabHeaderProps {
  isOrganizer: boolean;
  children: React.ReactNode;
}

export function ManagementTeamsTabHeader({ isOrganizer, children }: ManagementTeamsTabHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-olimpics-green-primary" />
        <div>
          <h2 className="text-2xl font-bold text-olimpics-green-primary">
            {isOrganizer ? "Gerenciar Equipes" : "Gerenciar Minhas Equipes"}
          </h2>
          <p className="text-muted-foreground">
            {isOrganizer 
              ? "Gerencie todas as equipes do evento" 
              : "Gerencie as equipes da sua filial"
            }
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
