
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatScoreValue } from './utils/scoreFormatters';

interface ModalityRankingsProps {
  modalityId: number;
  eventId: string | null;
  scoreType: 'time' | 'distance' | 'points';
}

interface RankedAthlete {
  atleta_id: string;
  atleta_nome: string;
  valor_pontuacao: number | null;
  posicao_final: number | null;
  medalha: string | null;
  unidade: string;
  equipe_nome?: string;
  tempo_minutos?: number | null;
  tempo_segundos?: number | null;
  tempo_milissegundos?: number | null;
}

export function ModalityRankings({ modalityId, eventId, scoreType }: ModalityRankingsProps) {
  const { data: rankings, isLoading } = useQuery({
    queryKey: ['modality-rankings', modalityId, eventId],
    queryFn: async () => {
      if (!modalityId || !eventId) return [];
      
      // Check if we need to add the time fields to the selection
      const selectFields = `
        id,
        atleta_id,
        valor_pontuacao,
        posicao_final,
        medalha,
        unidade,
        tempo_minutos,
        tempo_segundos,
        tempo_milissegundos,
        usuarios:atleta_id(
          nome_completo
        )
      `;
      
      const { data, error } = await supabase
        .from('pontuacoes')
        .select(selectFields)
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .order(scoreType === 'time' ? 'valor_pontuacao' : 'valor_pontuacao', { 
          ascending: scoreType === 'time' // Ascending for time (lower is better), descending for points/distance
        });
        
      if (error) {
        console.error('Error fetching modality rankings:', error);
        return [];
      }
      
      // Map and limit to top 10
      const rankedAthletes = data.map((score: any) => ({
        atleta_id: score.atleta_id,
        atleta_nome: score.usuarios?.nome_completo || 'Atleta',
        valor_pontuacao: score.valor_pontuacao,
        posicao_final: score.posicao_final,
        medalha: score.medalha,
        unidade: score.unidade,
        tempo_minutos: score.tempo_minutos,
        tempo_segundos: score.tempo_segundos,
        tempo_milissegundos: score.tempo_milissegundos,
      })).slice(0, 10);
      
      return rankedAthletes;
    },
    enabled: !!modalityId && !!eventId,
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!rankings || rankings.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Nenhuma pontuação registrada ainda</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Trophy className="h-5 w-5" />
          Classificação (Top 10)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Posição</TableHead>
              <TableHead>Atleta</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead>Medalha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankings.map((athlete, index) => (
              <TableRow key={athlete.atleta_id}>
                <TableCell className="font-medium">{index + 1}º</TableCell>
                <TableCell>{athlete.atleta_nome}</TableCell>
                <TableCell>
                  {formatScoreValue(athlete, scoreType)}
                </TableCell>
                <TableCell>
                  {athlete.medalha && (
                    <Badge 
                      variant="outline" 
                      className={`
                        ${athlete.medalha === 'ouro' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' : ''}
                        ${athlete.medalha === 'prata' ? 'bg-gray-100 text-gray-800 border-gray-300' : ''}
                        ${athlete.medalha === 'bronze' ? 'bg-amber-50 text-amber-800 border-amber-200' : ''}
                      `}
                    >
                      {athlete.medalha === 'ouro' ? 'Ouro' : ''}
                      {athlete.medalha === 'prata' ? 'Prata' : ''}
                      {athlete.medalha === 'bronze' ? 'Bronze' : ''}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
