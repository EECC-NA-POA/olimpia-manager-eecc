
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Athlete } from './tabs/scores/hooks/useAthletes';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { AthleteModalityResponse } from './types/modality';
import { Check, X } from 'lucide-react';
import { AthleteScoreCard } from './score-card/AthleteScoreCard';

interface AthleteCardProps {
  athlete: Athlete;
  isSelected?: boolean;
  onClick?: () => void;
  modalityId?: number;
  scoreType?: 'time' | 'distance' | 'points';
  eventId?: string | null;
  judgeId?: string;
}

export function AthleteCard({ 
  athlete, 
  isSelected, 
  onClick, 
  modalityId,
  scoreType = 'points',
  eventId,
  judgeId
}: AthleteCardProps) {
  // Fetch athlete identifier from payments
  const { data: paymentData } = useQuery({
    queryKey: ['athlete-payment', athlete.atleta_id, eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pagamentos')
        .select('numero_identificador')
        .eq('atleta_id', athlete.atleta_id)
        .eq('evento_id', eventId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching payment identifier:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!athlete.atleta_id && !!eventId,
  });

  // Fetch athlete branch information
  const { data: branchData } = useQuery({
    queryKey: ['athlete-branch', athlete.atleta_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          filiais (
            nome,
            estado
          )
        `)
        .eq('id', athlete.atleta_id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching branch data:', error);
        return null;
      }
      
      // Return the first filial from the array, or null if no filials
      return Array.isArray(data?.filiais) && data.filiais.length > 0 ? data.filiais[0] : null;
    },
    enabled: !!athlete.atleta_id,
  });

  // Fetch athlete scores
  const { data: scores } = useQuery({
    queryKey: ['athlete-scores', athlete.atleta_id, modalityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('valor_pontuacao, modalidade_id')
        .eq('atleta_id', athlete.atleta_id);
      
      if (error) {
        console.error('Error fetching athlete scores:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!athlete.atleta_id,
  });
  
  // Check if the athlete has a score for the selected modality
  const hasScoreForCurrentModality = modalityId ? 
    scores?.some(score => score.modalidade_id === modalityId) : 
    false;

  // Get athlete identifier or fallback to ID slice
  const athleteIdentifier = paymentData?.numero_identificador || athlete.atleta_id.slice(-6);

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
      />
    );
  }

  return (
    <Card 
      className={`
        cursor-pointer hover:border-primary/50 transition-colors overflow-hidden
        ${isSelected ? 'border-primary' : ''}
      `}
      onClick={onClick}
    >
      <div 
        className={`${hasScoreForCurrentModality ? 'bg-green-500' : 'bg-red-500'} h-1 w-full flex justify-end items-center pr-1`}
      >
        {hasScoreForCurrentModality && (
          <span className="text-[10px] text-white flex items-center">
            <Check size={12} className="mr-1" />
            Avaliado
          </span>
        )}
        {!hasScoreForCurrentModality && modalityId && (
          <span className="text-[10px] text-white flex items-center">
            <X size={12} className="mr-1" />
            Pendente
          </span>
        )}
      </div>
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
        <CardTitle className="text-base">{athlete.atleta_nome}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-3 gap-1 text-xs">
          <div>
            <p className="text-gray-500">ID</p>
            <p>{athleteIdentifier}</p>
          </div>
          <div>
            <p className="text-gray-500">Filial</p>
            <p>{branchData?.nome || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500">Estado</p>
            <p>{branchData?.estado || 'N/A'}</p>
          </div>
        </div>
        
        <div className="mt-3 grid grid-cols-2 gap-1 text-xs">
          <div>
            <p className="text-gray-500">Documento</p>
            <p>{athlete.tipo_documento}</p>
          </div>
          <div>
            <p className="text-gray-500">Número</p>
            <p>{athlete.numero_documento}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-gray-500 text-xs mb-1">Status</p>
          <div className="flex gap-2">
            {hasScoreForCurrentModality ? (
              <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                Avaliado
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                Pendente
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
