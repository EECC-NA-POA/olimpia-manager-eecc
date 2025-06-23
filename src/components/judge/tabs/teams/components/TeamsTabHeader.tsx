
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface TeamsTabHeaderProps {
  isOrganizer: boolean;
  children: React.ReactNode;
}

export function TeamsTabHeader({ isOrganizer, children }: TeamsTabHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Gerenciamento de Equipes
        </CardTitle>
        <CardDescription>
          {isOrganizer 
            ? "Visualize as equipes formadas pelos representantes de delegação" 
            : "Monte as equipes para as modalidades coletivas e gerencie os atletas"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
