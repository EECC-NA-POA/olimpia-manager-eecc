
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Athlete {
  id: string;
  nome_completo: string;
  email: string;
  numero_identificador: string | null;
}

interface AthletesListProps {
  athletes: Athlete[];
}

export default function AthletesList({ athletes }: AthletesListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Lista de Atletas</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 max-h-48 overflow-y-auto">
        <div className="space-y-2">
          {athletes.map((athlete) => (
            <div key={athlete.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{athlete.nome_completo}</div>
                <div className="text-xs text-gray-500 truncate">{athlete.email}</div>
              </div>
              {athlete.numero_identificador && (
                <Badge variant="outline" className="text-xs ml-2">
                  ID: {athlete.numero_identificador}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
