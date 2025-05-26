
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bateria } from '../../tabs/scores/hooks/useBateriaData';
import { ModalityRule } from '../../tabs/scores/hooks/useModalityRules';

interface BateriaInfoProps {
  baterias: Bateria[];
  rule: ModalityRule;
}

export function BateriaInfo({ baterias, rule }: BateriaInfoProps) {
  const parametros = rule.parametros || {};
  const raiasPorBateria = parametros.raias_por_bateria;
  const numTentativas = parametros.num_tentativas;

  if (!baterias.length) {
    return (
      <Card className="mb-4 border-amber-200 bg-amber-50">
        <CardContent className="pt-4">
          <p className="text-amber-800 text-sm">
            ⚠️ Nenhuma bateria configurada para esta modalidade. 
            Configure as baterias nas regras da modalidade primeiro.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-blue-800">
          Informações da Modalidade - {rule.regra_tipo}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
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
        
        {rule.regra_tipo === 'baterias' && (
          <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
            💡 Registre o resultado de cada tentativa {raiasPorBateria ? 'e selecione a raia' : ''}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
