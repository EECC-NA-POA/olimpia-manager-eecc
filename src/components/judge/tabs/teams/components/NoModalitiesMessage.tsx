
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export function NoModalitiesMessage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Equipes
        </CardTitle>
        <CardDescription>Nenhuma modalidade coletiva encontrada</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Não há modalidades coletivas disponíveis para este evento.
        </p>
      </CardContent>
    </Card>
  );
}
