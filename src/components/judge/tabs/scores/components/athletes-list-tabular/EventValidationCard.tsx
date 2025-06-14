
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function EventValidationCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg text-red-600">Evento não selecionado</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Selecione um evento para visualizar os atletas.
        </p>
      </CardContent>
    </Card>
  );
}
