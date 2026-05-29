
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, AlertCircle } from "lucide-react";
import { LoadingImage } from "@/components/ui/loading-image";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AthleteScore {
  atleta_id: string;
  modalidade_nome: string;
  pontuacao_total: number;
  media_pontuacao: number;
}

interface AthleteScoresSectionProps {
  athleteId: string;
  eventId: string | null;
}

export default function AthleteScoresSection({ athleteId, eventId }: AthleteScoresSectionProps) {
  const { data: scores, isLoading } = useQuery({
    queryKey: ['athlete-scores', athleteId, eventId],
    queryFn: async () => {
      if (!eventId) {
        console.warn('No event ID provided, cannot fetch scores');
        return [];
      }
      
      console.log('Fetching athlete scores for:', athleteId, 'in event:', eventId);
      
      // Set the current event ID in the session context
      const { error: configError } = await supabase.rpc('set_config', {
        parameter: 'app.current_event_id',
        value: eventId
      });

      if (configError) {
        console.error('Error setting event ID in session:', configError);
        // Continue anyway
      }
      
      const { data, error } = await supabase
        .from('vw_pontuacoes_gerais_atletas')
        .select('*')
        .eq('atleta_id', athleteId)
        .eq('evento_id', eventId);

      if (error) {
        console.error('Error fetching athlete scores:', error);
        throw error;
      }

      console.log(`Found ${data?.length || 0} scores for athlete ${athleteId} in event ${eventId}`);
      return data as AthleteScore[];
    },
    enabled: !!athleteId && !!eventId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingImage size="sm" />
      </div>
    );
  }

  if (!scores?.length) {
    return (
      <Alert variant="default" className="bg-yellow-50 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription>
          Ainda não há registros de pontuação disponíveis.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-olimpics-green-primary">
          <Trophy className="h-5 w-5" />
          Desempenho nas Modalidades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modalidade</TableHead>
              <TableHead className="text-right">Pontuação Total</TableHead>
              <TableHead className="text-right">Média</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scores.map((score, index) => (
              <TableRow key={`${score.modalidade_nome}-${index}`}>
                <TableCell className="font-medium">{score.modalidade_nome}</TableCell>
                <TableCell className="text-right">{score.pontuacao_total}</TableCell>
                <TableCell className="text-right">
                  {typeof score.media_pontuacao === 'number' 
                    ? score.media_pontuacao.toFixed(2) 
                    : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
