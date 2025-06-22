
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Plus } from 'lucide-react';

export function BateriaRequiredMessage() {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-full bg-orange-100 p-3">
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-orange-900">
              Bateria Necessária
            </h3>
            <p className="text-orange-700 max-w-md">
              Esta modalidade utiliza o sistema de baterias. Para começar a pontuar os atletas, 
              você deve primeiro criar uma nova bateria usando o botão "Nova Bateria" acima.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-100 px-3 py-2 rounded-lg">
            <Plus className="h-4 w-4" />
            <span>Clique em "Nova Bateria" para começar</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
