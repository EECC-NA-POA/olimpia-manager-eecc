
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { MedalDisplay } from './MedalDisplay';
import { ScoreRecord } from '../types';

interface AthleteData {
  atleta_id: string;
  equipe_id?: number;
  atleta_nome: string;
  tipo_documento: string;
  numero_documento: string;
  numero_identificador?: string;
}

interface AthleteCardHeaderProps {
  athlete: AthleteData;
  existingScore: ScoreRecord | null;
  medalInfo: any;
  scoreType: 'tempo' | 'distancia' | 'pontos';
  modalityRule?: any;
}

export function AthleteCardHeader({ 
  athlete, 
  existingScore, 
  medalInfo, 
  scoreType, 
  modalityRule 
}: AthleteCardHeaderProps) {
  return (
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-lg">{athlete.atleta_nome}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {athlete.tipo_documento}: {athlete.numero_documento}
          </p>
          {athlete.numero_identificador && (
            <p className="text-xs text-muted-foreground">
              ID: {athlete.numero_identificador}
            </p>
          )}
          {modalityRule && (
            <p className="text-xs text-blue-600 font-medium mt-1">
              Modalidade: {modalityRule.regra_tipo}
              {modalityRule.parametros?.unidade && ` (${modalityRule.parametros.unidade})`}
            </p>
          )}
        </div>
        
        <MedalDisplay 
          scoreRecord={existingScore || null} 
          medalInfo={medalInfo || null}
          scoreType={scoreType} 
        />
      </div>
    </CardHeader>
  );
}
