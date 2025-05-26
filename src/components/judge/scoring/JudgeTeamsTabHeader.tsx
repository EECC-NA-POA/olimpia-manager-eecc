
import React from 'react';
import { Users } from 'lucide-react';

interface JudgeTeamsTabHeaderProps {
  children: React.ReactNode;
}

export function JudgeTeamsTabHeader({ children }: JudgeTeamsTabHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-olimpics-green-primary" />
        <div>
          <h2 className="text-2xl font-bold text-olimpics-green-primary">
            Pontuar Equipes
          </h2>
          <p className="text-muted-foreground">
            Visualize e pontue as equipes das modalidades
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
