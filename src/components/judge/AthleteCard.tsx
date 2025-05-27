import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Athlete } from './tabs/scores/hooks/useAthletes';
import { AthleteScoreCard } from './score-card/AthleteScoreCard';
import { AthleteScoreStatus } from './components/AthleteScoreStatus';
import { useAthletePaymentData, useAthleteBranchData, useAthleteScores } from './hooks/useAthleteData';
import { useBateriaData } from './tabs/scores/hooks/useBateriaData';
import { useBateriaScores } from './score-card/components/bateria-scores/hooks/useBateriaScores';
import { useScoreMutation } from './score-card/components/bateria-scores/hooks/useScoreMutation';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface AthleteCardProps {
  athlete: Athlete;
  isSelected?: boolean;
  onClick?: () => void;
  modalityId?: number;
  scoreType?: 'tempo' | 'distancia' | 'pontos';
  eventId?: string | null;
  judgeId?: string;
  modalityRule?: any;
}

export function AthleteCard({ 
  athlete, 
  isSelected, 
  onClick, 
  modalityId,
  scoreType = 'pontos',
  eventId,
  judgeId,
  modalityRule
}: AthleteCardProps) {
  console.log('=== ATHLETE CARD PROPS DEBUG ===');
  console.log('Received eventId prop:', eventId);
  console.log('Received modalityRule:', modalityRule);
  
  // Fetch athlete data using custom hooks
  const { data: paymentData, isLoading: isLoadingPayment } = useAthletePaymentData(athlete.atleta_id, eventId);
  const { data: branchData, isLoading: isLoadingBranch } = useAthleteBranchData(athlete.atleta_id);
  const { data: scores } = useAthleteScores(athlete.atleta_id);
  
  // Get bateria data and scores for closed card display
  const { data: bateriasData = [] } = useBateriaData(modalityId, eventId);
  const { batteriaScores = [] } = useBateriaScores({
    athleteId: athlete.atleta_id,
    modalityId: modalityId || 0,
    eventId: eventId || '',
    baterias: bateriasData
  });

  // Score mutation for quick editing
  const { updateScoreMutation } = useScoreMutation({
    athleteId: athlete.atleta_id,
    modalityId: modalityId || 0,
    eventId: eventId || '',
    judgeId: judgeId || ''
  });
  
  // Check if the athlete has a score for the selected modality
  const hasScoreForCurrentModality = modalityId ? 
    scores?.some(score => score.modalidade_id === modalityId) : 
    false;

  // Get athlete identifier from payment data or fallback to ID slice
  const athleteIdentifier = paymentData?.numero_identificador || athlete.atleta_id.slice(-6);

  console.log('Final athlete identifier used:', athleteIdentifier);
  console.log('=== AthleteCard Debug End ===');

  // Format score display for bateria scores
  const formatScoreDisplay = (score: any) => {
    if (scoreType === 'tempo') {
      const totalMs = score.valor_pontuacao || 0;
      const minutes = Math.floor(totalMs / 60000);
      const seconds = Math.floor((totalMs % 60000) / 1000);
      const ms = totalMs % 1000;
      
      if (minutes > 0) {
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
      } else {
        return `${seconds}.${ms.toString().padStart(3, '0')}s`;
      }
    } else if (scoreType === 'distancia') {
      const value = score.valor_pontuacao || 0;
      return `${value.toFixed(2)}m`;
    } else {
      return score.valor_pontuacao ? `${score.valor_pontuacao} ${score.unidade}` : '';
    }
  };

  const handleScoreUpdate = (scoreId: number, newValue: string) => {
    let processedValue: any = newValue;
    
    // Convert empty string to null
    if (processedValue === '') {
      processedValue = null;
    } else if (scoreType === 'distancia') {
      processedValue = parseFloat(newValue);
    } else if (scoreType === 'pontos') {
      processedValue = parseFloat(newValue);
    } else if (scoreType === 'tempo') {
      processedValue = parseInt(newValue);
    }

    updateScoreMutation.mutate({
      scoreId,
      newValues: { valor_pontuacao: processedValue }
    });
  };

  // If we're in selected view and have all necessary props, render the score card
  if (isSelected && modalityId && eventId && judgeId && scoreType) {
    return (
      <AthleteScoreCard 
        athlete={{
          atleta_id: athlete.atleta_id,
          atleta_nome: athlete.atleta_nome,
          tipo_documento: athlete.tipo_documento,
          numero_documento: athlete.numero_documento,
          numero_identificador: athleteIdentifier
        }}
        modalityId={modalityId}
        eventId={eventId}
        judgeId={judgeId}
        scoreType={scoreType}
        modalityRule={modalityRule}
      />
    );
  }

  return (
    <Card 
      className={`
        group cursor-pointer transition-all duration-300 ease-in-out
        hover:shadow-lg hover:scale-[1.02] hover:border-primary/50
        ${isSelected ? 'border-primary shadow-md scale-[1.01]' : 'shadow-sm'}
        bg-white overflow-hidden relative
      `}
      onClick={onClick}
    >
      <AthleteScoreStatus 
        hasScoreForCurrentModality={hasScoreForCurrentModality}
        modalityId={modalityId}
      />
      
      <CardHeader className="pb-3 pt-6">
        <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors mb-2">
          {athlete.atleta_nome}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm">
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
            ID: {athleteIdentifier}
          </span>
          {branchData?.nome && (
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-200">
              {branchData.nome}
            </span>
          )}
          {branchData?.estado && (
            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-medium border border-purple-200">
              {branchData.estado}
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Bateria Scores Interface */}
        {bateriasData.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Pontuações por Bateria</h4>
            <div className="space-y-2">
              {bateriasData.map((bateria) => {
                const score = batteriaScores.find(s => s.bateria_id === bateria.id);
                
                return (
                  <div key={bateria.id} className="flex items-center justify-between bg-white rounded p-2 border">
                    <span className="text-sm font-medium text-gray-700">Bateria {bateria.numero}</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step={scoreType === 'distancia' ? '0.01' : '1'}
                        placeholder={scoreType === 'distancia' ? '0.00' : '0'}
                        value={score?.valor_pontuacao?.toString() || ''}
                        onChange={(e) => {
                          if (score) {
                            handleScoreUpdate(score.id, e.target.value);
                          }
                        }}
                        className="w-20 h-8 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-xs text-gray-500 min-w-[30px]">
                        {scoreType === 'distancia' ? 'm' : scoreType === 'tempo' ? 'ms' : 'pts'}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Focus on the input for editing
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
      </CardContent>
    </Card>
  );
}
