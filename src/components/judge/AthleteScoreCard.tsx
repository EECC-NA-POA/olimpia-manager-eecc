
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { parseTimeToMilliseconds, calculateTimeFromMilliseconds, formatMedal } from './utils/scoreFormatters';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScoreRecord } from '@/lib/types/database';

interface AthleteScoreCardProps {
  athlete: {
    atleta_id: string;
    atleta_nome: string;
    tipo_documento: string;
    numero_documento: string;
    numero_identificador?: string;
    equipe_id?: number;
  };
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType: 'time' | 'distance' | 'points';
}

// Define separate schemas for different score types
const timeScoreSchema = z.object({
  minutes: z.string().transform(val => parseInt(val) || 0),
  seconds: z.string().transform(val => parseInt(val) || 0),
  milliseconds: z.string().transform(val => parseInt(val) || 0),
  notes: z.string().optional(),
});

const pointsScoreSchema = z.object({
  score: z.string().transform(val => parseFloat(val) || 0),
  notes: z.string().optional(),
});

export function AthleteScoreCard({ 
  athlete, 
  modalityId, 
  eventId, 
  judgeId,
  scoreType
}: AthleteScoreCardProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get initial schema based on score type
  const schema = scoreType === 'time' ? timeScoreSchema : pointsScoreSchema;
  
  // Define the form with proper types
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: scoreType === 'time' 
      ? { minutes: '0', seconds: '0', milliseconds: '0', notes: '' } 
      : { score: '0', notes: '' },
  });

  // Fetch existing score if it exists
  const { data: existingScore } = useQuery({
    queryKey: ['score', athlete.atleta_id, modalityId, eventId],
    queryFn: async () => {
      if (!eventId) return null;
      
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('*')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('atleta_id', athlete.atleta_id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching existing score:', error);
        return null;
      }
      
      return data as ScoreRecord;
    },
    enabled: !!eventId && !!athlete.atleta_id && !!modalityId,
  });

  // Set form values when existing score is loaded
  React.useEffect(() => {
    if (existingScore) {
      if (scoreType === 'time' && existingScore.tempo_minutos !== null) {
        form.setValue('minutes', existingScore.tempo_minutos?.toString() || '0');
        form.setValue('seconds', existingScore.tempo_segundos?.toString() || '0');
        form.setValue('milliseconds', existingScore.tempo_milissegundos?.toString() || '0');
      } else if (scoreType !== 'time' && existingScore.valor_pontuacao !== null) {
        form.setValue('score', existingScore.valor_pontuacao?.toString() || '0');
      }
      
      form.setValue('notes', existingScore.observacoes || '');
      setIsExpanded(true);
    }
  }, [existingScore, form, scoreType]);

  // Calculate positions after score submission
  const calculatePositions = async () => {
    if (!eventId || !modalityId) return;
    
    // Get all scores for this modality
    const { data: allScores, error } = await supabase
      .from('pontuacoes')
      .select('*')
      .eq('evento_id', eventId)
      .eq('modalidade_id', modalityId);
    
    if (error || !allScores) {
      console.error('Error calculating positions:', error);
      return;
    }
    
    // Sort based on score type
    let sortedScores = [...allScores] as ScoreRecord[];
    
    if (scoreType === 'time') {
      // For time, lower is better (ascending)
      sortedScores.sort((a, b) => {
        const aTotal = parseTimeToMilliseconds(
          a.tempo_minutos || 0,
          a.tempo_segundos || 0,
          a.tempo_milissegundos || 0
        );
        
        const bTotal = parseTimeToMilliseconds(
          b.tempo_minutos || 0,
          b.tempo_segundos || 0,
          b.tempo_milissegundos || 0
        );
        
        return aTotal - bTotal;
      });
    } else {
      // For points and distance, higher is better (descending)
      sortedScores.sort((a, b) => (b.valor_pontuacao || 0) - (a.valor_pontuacao || 0));
    }
    
    // Update positions and medals for each score
    for (let i = 0; i < sortedScores.length; i++) {
      const position = i + 1;
      const medal = formatMedal(position);
      
      await supabase
        .from('pontuacoes')
        .update({
          posicao_final: position,
          medalha: medal,
        })
        .eq('id', sortedScores[i].id);
    }
  };

  // Submit score mutation
  const submitScoreMutation = useMutation({
    mutationFn: async (data: z.infer<typeof schema>) => {
      if (!eventId) throw new Error('Event ID is missing');
      
      // Convert data based on score type
      let scoreData;
      
      if (scoreType === 'time' && 'minutes' in data) {
        // Convert string values to numbers using the transformations in the schema
        const minutes = parseInt(data.minutes.toString()) || 0;
        const seconds = parseInt(data.seconds.toString()) || 0;
        const milliseconds = parseInt(data.milliseconds.toString()) || 0;
        
        scoreData = {
          tempo_minutos: minutes,
          tempo_segundos: seconds,
          tempo_milissegundos: milliseconds,
          // Calculate total milliseconds for easier sorting
          valor_pontuacao: parseTimeToMilliseconds(minutes, seconds, milliseconds),
          unidade: 'ms'
        };
      } else if ('score' in data) {
        const score = parseFloat(data.score.toString()) || 0;
        scoreData = {
          valor_pontuacao: score,
          tempo_minutos: null,
          tempo_segundos: null,
          tempo_milissegundos: null,
          unidade: scoreType === 'distance' ? 'm' : 'pontos'
        };
      } else {
        throw new Error('Invalid form data format');
      }
      
      const commonFields = {
        observacoes: data.notes || null,
        juiz_id: judgeId,
        data_registro: new Date().toISOString()
      };
      
      // Check if score already exists
      const { data: existingScore } = await supabase
        .from('pontuacoes')
        .select('id')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('atleta_id', athlete.atleta_id)
        .maybeSingle();
      
      if (existingScore) {
        // Update existing score
        await supabase
          .from('pontuacoes')
          .update({
            ...scoreData,
            ...commonFields
          })
          .eq('id', existingScore.id);
      } else {
        // Insert new score
        await supabase
          .from('pontuacoes')
          .insert({
            evento_id: eventId,
            modalidade_id: modalityId,
            atleta_id: athlete.atleta_id,
            ...scoreData,
            ...commonFields
          });
      }
      
      // If this athlete is part of a team, we need to retrieve team members
      if (athlete.equipe_id) {
        const { data: teamMembers } = await supabase
          .from('inscricoes_modalidades')
          .select(`
            atleta_id
          `)
          .eq('modalidade_id', modalityId)
          .eq('evento_id', eventId)
          .eq('equipe_id', athlete.equipe_id);
        
        // Update scores for all team members with the same score
        if (teamMembers && teamMembers.length > 0) {
          for (const member of teamMembers) {
            if (member.atleta_id !== athlete.atleta_id) {
              // Check if score exists for team member
              const { data: memberScore } = await supabase
                .from('pontuacoes')
                .select('id')
                .eq('evento_id', eventId)
                .eq('modalidade_id', modalityId)
                .eq('atleta_id', member.atleta_id)
                .maybeSingle();
              
              if (memberScore) {
                // Update existing score
                await supabase
                  .from('pontuacoes')
                  .update({
                    ...scoreData,
                    ...commonFields,
                    juiz_id: judgeId,
                    data_registro: new Date().toISOString()
                  })
                  .eq('id', memberScore.id);
              } else {
                // Insert new score
                await supabase
                  .from('pontuacoes')
                  .insert({
                    evento_id: eventId,
                    modalidade_id: modalityId,
                    atleta_id: member.atleta_id,
                    ...scoreData,
                    ...commonFields,
                    juiz_id: judgeId,
                    data_registro: new Date().toISOString()
                  });
              }
            }
          }
        }
      }
      
      // Calculate positions after saving scores
      await calculatePositions();
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['score', athlete.atleta_id, modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['athletes', modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['modality-rankings', modalityId, eventId] });
      toast.success("Pontuação registrada com sucesso");
      setIsExpanded(false);
    },
    onError: (error) => {
      console.error('Error submitting score:', error);
      toast.error("Não foi possível registrar a pontuação");
    }
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    submitScoreMutation.mutate(data);
  };

  const medalDisplay = existingScore?.medalha ? (
    <Badge 
      className={`
        ${existingScore.medalha === 'ouro' ? 'bg-yellow-400 text-yellow-900' : ''}
        ${existingScore.medalha === 'prata' ? 'bg-gray-300 text-gray-700' : ''}
        ${existingScore.medalha === 'bronze' ? 'bg-amber-600 text-amber-950' : ''}
        ${existingScore.medalha === 'participacao' ? 'bg-blue-200 text-blue-800' : ''}
      `}
    >
      {existingScore.medalha === 'ouro' ? '1º Lugar' : ''}
      {existingScore.medalha === 'prata' ? '2º Lugar' : ''}
      {existingScore.medalha === 'bronze' ? '3º Lugar' : ''}
      {existingScore.medalha === 'participacao' ? 'Participação' : ''}
    </Badge>
  ) : null;

  return (
    <Card className={`
      overflow-hidden transition-all duration-200
      ${existingScore ? 'border-blue-300 shadow-blue-100' : ''}
    `}>
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
          </div>
          <div className="flex items-center space-x-2">
            {medalDisplay}
            {existingScore && (
              <Badge variant="outline" className="bg-green-50">
                {scoreType === 'time' ? 
                  `${existingScore.tempo_minutos || 0}m ${existingScore.tempo_segundos || 0}s ${existingScore.tempo_milissegundos || 0}ms` : 
                  `${existingScore.valor_pontuacao || 0} ${scoreType === 'distance' ? 'm' : 'pontos'}`
                }
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Button 
          variant={isExpanded ? "outline" : "default"}
          size="sm" 
          className="w-full my-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Esconder formulário" : "Registrar pontuação"}
        </Button>

        {isExpanded && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              {scoreType === 'time' ? (
                <div className="grid grid-cols-3 gap-2">
                  <FormField
                    control={form.control}
                    name="minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minutos</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            placeholder="min" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="seconds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Segundos</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="59"
                            placeholder="seg" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="milliseconds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Milissegundos</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="999"
                            placeholder="ms" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {scoreType === 'distance' ? 'Distância (metros)' : 'Pontuação'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step={scoreType === 'distance' ? '0.01' : '1'}
                          min="0" 
                          placeholder={scoreType === 'distance' ? '0.00' : '0'} 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações adicionais"
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit"
                disabled={submitScoreMutation.isPending}
                className="w-full"
              >
                {submitScoreMutation.isPending ? 'Enviando...' : 'Salvar Pontuação'}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
