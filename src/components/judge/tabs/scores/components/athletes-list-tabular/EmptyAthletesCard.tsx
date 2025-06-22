
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function EmptyAthletesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Nenhum atleta inscrito</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Não há atletas inscritos nesta modalidade ou suas inscrições não estão confirmadas.
        </p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800">Dica para resolução:</h4>
          <ul className="text-sm text-blue-700 mt-2 space-y-1">
            <li>• Verifique se há atletas inscritos na modalidade</li>
            <li>• Confirme se as inscrições estão com status "confirmado"</li>
            <li>• Verifique se a modalidade está corretamente associada ao evento</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
