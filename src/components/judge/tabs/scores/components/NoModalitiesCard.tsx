
import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';

export function NoModalitiesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nenhuma modalidade disponível</CardTitle>
        <CardDescription>
          Não existem modalidades com atletas confirmados para este evento.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
