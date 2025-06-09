
import React from 'react';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AthleteCardHeader } from './components/AthleteCardHeader';
import { DynamicScoreForm } from './components/DynamicScoreForm';
import { useDynamicAthleteScoreCard } from './hooks/useDynamicAthleteScoreCard';
import { AthleteScoreCardProps } from './types';

export function DynamicAthleteScoreCard({ 
  athlete, 
  modalityId, 
  eventId, 
  judgeId,
  scoreType
}: AthleteScoreCardProps) {
  const {
    isExpanded,
    setIsExpanded,
    existingScore,
    modelo,
    hasDynamicScoring,
    initialFormData
  } = useDynamicAthleteScoreCard(
    athlete,
    modalityId,
    eventId,
    judgeId
  );

  console.log('DynamicAthleteScoreCard - Debug info:', {
    athleteName: athlete.atleta_nome,
    modalityId,
    hasDynamicScoring,
    modelo: modelo ? {
      id: modelo.id,
      codigo: modelo.codigo_modelo,
      descricao: modelo.descricao
    } : null,
    existingScore: existingScore ? 'Has score' : 'No score'
  });

  // If no dynamic scoring model is configured, return empty
  if (!hasDynamicScoring || !modelo) {
    console.log('No dynamic scoring available for athlete:', athlete.atleta_nome);
    return null;
  }

  const handleSubmitSuccess = () => {
    setIsExpanded(false);
  };

  return (
    <Card className={`
      overflow-hidden transition-all duration-200
      ${existingScore ? 'border-blue-300 shadow-blue-100' : ''}
    `}>
      <AthleteCardHeader
        athlete={athlete}
        existingScore={existingScore}
        medalInfo={null}
        scoreType={scoreType}
        modalityRule={{ regra_tipo: 'dynamic', parametros: {} }}
      />

      <CardContent className="pt-0 space-y-3">
        {existingScore && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-blue-800 text-sm font-medium">
              ✓ Pontuação registrada
            </div>
            <div className="text-blue-700 text-xs mt-1">
              {existingScore.observacoes && `Observações: ${existingScore.observacoes}`}
            </div>
          </div>
        )}

        <Button 
          variant={isExpanded ? "outline" : "default"}
          size="sm" 
          className="w-full"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Esconder formulário" : "Registrar pontuação"}
        </Button>

        {isExpanded && modelo && (
          <DynamicScoreForm
            modeloId={modelo.id}
            modalityId={modalityId}
            athleteId={athlete.atleta_id}
            equipeId={athlete.equipe_id}
            eventId={eventId!}
            judgeId={judgeId}
            initialValues={initialFormData}
            onSuccess={handleSubmitSuccess}
          />
        )}
      </CardContent>
    </Card>
  );
}
