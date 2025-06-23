
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Athlete } from '../tabs/scores/hooks/useAthletes';
import { FileText } from 'lucide-react';

interface AthleteInfoProps {
  athlete: Athlete;
  athleteIdentifier: string;
  hasScoreForCurrentModality: boolean;
}

export function AthleteInfo({ 
  athlete, 
  athleteIdentifier, 
  hasScoreForCurrentModality 
}: AthleteInfoProps) {
  return (
    <div className="space-y-4">
      {/* Document Info */}
      <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
        <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Documento</p>
          <p className="text-sm font-medium text-gray-900">
            {athlete.tipo_documento}
          </p>
          <p className="text-xs text-gray-600 font-mono">
            {athlete.numero_documento}
          </p>
        </div>
      </div>
      
      {/* Status Badge */}
      <div className="flex justify-center pt-2">
        {hasScoreForCurrentModality ? (
          <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
            ✓ Avaliado
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            ⏳ Pendente
          </Badge>
        )}
      </div>
    </div>
  );
}
