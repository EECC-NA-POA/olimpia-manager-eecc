
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface NoModalitiesCardProps {
  isCollective?: boolean;
}

export function NoModalitiesCard({ isCollective = false }: NoModalitiesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nenhuma modalidade disponível</CardTitle>
        <CardDescription>
          {isCollective 
            ? "Não existem modalidades coletivas disponíveis para este evento."
            : "Não existem modalidades com atletas confirmados para este evento."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {isCollective 
            ? "Verifique se foram cadastradas modalidades coletivas para este evento."
            : "Verifique se existem atletas com inscrição confirmada nas modalidades."}
        </p>
      </CardContent>
    </Card>
  );
}
