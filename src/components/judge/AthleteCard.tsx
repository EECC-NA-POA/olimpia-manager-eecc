
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

interface AthleteCardProps {
  athlete: Athlete;
  isSelected?: boolean;
  onClick?: () => void;
}

export function AthleteCard({ athlete, isSelected, onClick }: AthleteCardProps) {
  // Fetch athlete scores
  const { data: scores } = useQuery({
    queryKey: ['athlete-scores', athlete.atleta_id],
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

  // Get total score or use a placeholder
  const totalScore = scores?.reduce((sum, score) => sum + (score.valor_pontuacao || 0), 0) || 0;
  
  // Get athlete's modalities
  const { data: modalities } = useQuery<AthleteModalityResponse[]>({
    queryKey: ['athlete-modalities', athlete.atleta_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inscricoes_modalidades')
        .select('modalidade_id, modalidades(nome)')
        .eq('atleta_id', athlete.atleta_id);
      
      if (error) {
        console.error('Error fetching athlete modalities:', error);
        return [];
      }
      
      // Transform the data to match our AthleteModalityResponse interface
      return (data || []).map(item => ({
        modalidade_id: item.modalidade_id,
        modalidades: item.modalidades
      })) as unknown as AthleteModalityResponse[];
    },
    enabled: !!athlete.atleta_id,
  });

  return (
    <Card 
      className={`
        cursor-pointer hover:border-primary/50 transition-colors overflow-hidden
        ${isSelected ? 'border-primary' : ''}
      `}
      onClick={onClick}
    >
      <div className="bg-red-500 h-1 w-full"></div>
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
        <CardTitle className="text-base">{athlete.atleta_nome}</CardTitle>
        <div className="text-xs flex flex-col items-end">
          <span className="text-gray-500">Pontuação total</span>
          <span className="font-semibold">{totalScore}</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-3 gap-1 text-xs">
          <div>
            <p className="text-gray-500">ID</p>
            <p>{athlete.atleta_id.slice(-6)}</p>
          </div>
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
          <p className="text-gray-500 text-xs mb-1">Modalidades</p>
          <div className="flex flex-wrap gap-2">
            {modalities && modalities.length > 0 ? (
              modalities.map((modalidade, i) => (
                <Badge key={i} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                  {modalidade.modalidades?.nome || `Modalidade ${modalidade.modalidade_id}`}
                </Badge>
              ))
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-800 border-gray-200">
                Sem modalidades
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-gray-500 text-xs mb-1">Status</p>
          <div className="flex gap-2">
            {scores && scores.length > 0 ? (
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
