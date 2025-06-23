
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModalityRule } from '../../tabs/scores/hooks/useModeloConfiguration';
import { Bateria } from '../../tabs/scores/hooks/useBateriaData';

interface ModalityHeaderProps {
  rule: ModalityRule;
  baterias: Bateria[];
}

export function ModalityHeader({ rule, baterias }: ModalityHeaderProps) {
  const parametros = rule.parametros || {};
  const raiasPorBateria = parametros.raias_por_bateria;
  const numTentativas = parametros.num_tentativas;

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-blue-800">
          Modalidade: {rule.regra_tipo} 
          {parametros.unidade && ` (${parametros.unidade})`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-700">Baterias:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {baterias.map((bateria) => (
                <Badge key={bateria.id} variant="outline" className="text-xs">
                  Bateria {bateria.numero}
                </Badge>
              ))}
            </div>
          </div>
          
          {raiasPorBateria && (
            <div>
              <span className="font-medium text-blue-700">Raias por bateria:</span>
              <p className="text-blue-600">{raiasPorBateria}</p>
            </div>
          )}
          
          {numTentativas && (
            <div>
              <span className="font-medium text-blue-700">Tentativas:</span>
              <p className="text-blue-600">{numTentativas}</p>
            </div>
          )}
          
          {parametros.unidade && (
            <div>
              <span className="font-medium text-blue-700">Unidade:</span>
              <p className="text-blue-600">{parametros.unidade}</p>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          {rule.regra_tipo === 'distancia' && parametros.subunidade === 'cm' && (
            <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
              💡 Para distância: informe metros e centímetros separadamente
            </div>
          )}
          
          {rule.regra_tipo === 'tempo' && (
            <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
              💡 Para tempo: informe minutos, segundos e milissegundos
            </div>
          )}
          
          {parametros.baterias && (
            <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
              💡 Registre o resultado de cada tentativa {raiasPorBateria ? 'e selecione a raia' : ''}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
