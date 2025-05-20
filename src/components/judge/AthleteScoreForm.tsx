
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ScoreInputField } from './ScoreInputField';
import { parseTimeToMilliseconds, calculateTimeFromMilliseconds, formatMedal } from './utils/scoreFormatters';
import { ModalityRankings } from './ModalityRankings';
import { Badge } from '@/components/ui/badge';
import { ScoreRecord, Modality } from '@/lib/types/database';

// Define separate schemas for different score types
const timeScoreSchema = z.object({
  time: z.object({
    minutes: z.number().min(0, 'Minutos devem ser positivos'),
    seconds: z.number().min(0, 'Segundos devem ser positivos').max(59, 'Segundos devem ser entre 0 e 59'),
    milliseconds: z.number().min(0, 'Milissegundos devem ser positivos').max(999, 'Milissegundos devem ser entre 0 e 999'),
  }),
  notes: z.string().optional(),
});

const pointsScoreSchema = z.object({
  score: z.number().min(0, 'A pontuação deve ser positiva'),
  notes: z.string().optional(),
});

// Type for form data based on score type
type ScoreFormValues = 
  | z.infer<typeof timeScoreSchema> 
  | z.infer<typeof pointsScoreSchema>;

interface AthleteScoreFormProps {
  athleteId: string;
  modalityId: number;
  eventId: string | null;
  judgeId: string;
}

interface TeamMember {
  id: string;
  name: string;
}

export function AthleteScoreForm({ 
  athleteId, 
  modalityId, 
  eventId, 
  judgeId 
}: AthleteScoreFormProps) {
  const queryClient = useQueryClient();
  
  // Get modality details to determine score type
  const { data: modality } = useQuery({
    queryKey: ['modality-details', modalityId],
    queryFn: async () => {
      if (!modalityId) return null;
      
      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, tipo_pontuacao, tipo_modalidade')
        .eq('id', modalityId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching modality details:', error);
        toast.error('Erro ao carregar detalhes da modalidade');
        return null;
      }
      
      return {
        modalidade_id: data?.id,
        modalidade_nome: data?.nome,
        tipo_pontuacao: data?.tipo_pontuacao || 'points',
        tipo_modalidade: data?.tipo_modalidade
      } as Modality;
    },
    enabled: !!modalityId,
  });

  // Get team members if modality is team-based
  const { data: teamMembers } = useQuery({
    queryKey: ['team-members', modalityId, athleteId, eventId],
    queryFn: async () => {
      if (!modalityId || !athleteId || !eventId || !modality?.tipo_modalidade?.includes('COLETIVA')) {
        return [];
      }
      
      try {
        // First get the team ID for this athlete in this modality
        const { data: enrollment, error: enrollmentError } = await supabase
          .from('inscricoes_modalidades')
          .select('equipe_id')
          .eq('modalidade_id', modalityId)
          .eq('atleta_id', athleteId)
          .eq('evento_id', eventId)
          .maybeSingle();
        
        if (enrollmentError || !enrollment?.equipe_id) {
          console.error('Error fetching team:', enrollmentError);
          return [];
        }
        
        // Then get all athletes in that team
        const { data: members, error: membersError } = await supabase
          .from('inscricoes_modalidades')
          .select(`
            atleta_id,
            usuarios:atleta_id(nome_completo)
          `)
          .eq('modalidade_id', modalityId)
          .eq('evento_id', eventId)
          .eq('equipe_id', enrollment.equipe_id);
        
        if (membersError) {
          console.error('Error fetching team members:', membersError);
          return [];
        }
        
        return members.map(member => ({
          id: member.atleta_id,
          name: member.usuarios?.nome_completo || 'Atleta',
        })) as TeamMember[];
      } catch (error) {
        console.error('Error in team members query:', error);
        return [];
      }
    },
    enabled: !!modalityId && !!athleteId && !!eventId && !!modality?.tipo_modalidade?.includes('COLETIVA'),
  });
  
  const isTeamModality = modality?.tipo_modalidade?.includes('COLETIVA');
  const scoreType = modality?.tipo_pontuacao as 'time' | 'distance' | 'points' || 'points';
  
  // Create a schema based on the score type
  const schema = scoreType === 'time' ? timeScoreSchema : pointsScoreSchema;
  
  const form = useForm<ScoreFormValues>({
    resolver: zodResolver(schema),
    defaultValues: scoreType === 'time' 
      ? { time: { minutes: 0, seconds: 0, milliseconds: 0 }, notes: '' } as any
      : { score: 0, notes: '' } as any,
  });

  // Fetch existing score if it exists
  const { data: existingScore } = useQuery({
    queryKey: ['score', athleteId, modalityId, eventId],
    queryFn: async () => {
      if (!eventId) return null;
      
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('*')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('atleta_id', athleteId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching existing score:', error);
        return null;
      }
      
      return data as ScoreRecord;
    },
    enabled: !!eventId && !!athleteId && !!modalityId,
  });

  // Set form values when existing score is loaded
  useEffect(() => {
    if (existingScore) {
      if (scoreType === 'time' && existingScore.tempo_minutos !== null) {
        form.setValue('time', {
          minutes: existingScore.tempo_minutos || 0,
          seconds: existingScore.tempo_segundos || 0,
          milliseconds: existingScore.tempo_milissegundos || 0
        } as any);
      } else if (scoreType !== 'time' && existingScore.valor_pontuacao !== null) {
        form.setValue('score', existingScore.valor_pontuacao || 0);
      }
      
      form.setValue('notes', existingScore.observacoes || '');
    }
  }, [existingScore, form, scoreType]);

  // Function to calculate positions after score submission
  const calculatePositions = async () => {
    if (!eventId || !modalityId) return;
    
    // First, get all scores for this modality
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
        // Convert both to milliseconds for comparison
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
    mutationFn: async (data: ScoreFormValues) => {
      if (!eventId) throw new Error('Event ID is missing');
      
      // Convert data based on score type
      let scoreData;
      
      if (scoreType === 'time' && 'time' in data) {
        scoreData = {
          tempo_minutos: data.time.minutes || 0,
          tempo_segundos: data.time.seconds || 0,
          tempo_milissegundos: data.time.milliseconds || 0,
          // Calculate total milliseconds for easier sorting
          valor_pontuacao: parseTimeToMilliseconds(
            data.time.minutes || 0,
            data.time.seconds || 0,
            data.time.milliseconds || 0
          ),
          unidade: 'ms'
        };
      } else if ('score' in data) {
        scoreData = {
          valor_pontuacao: data.score,
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
      
      // Function to save or update a score for a single athlete
      const saveScore = async (currentAthleteId: string) => {
        // Check if score already exists
        const { data: existingScore } = await supabase
          .from('pontuacoes')
          .select('id')
          .eq('evento_id', eventId)
          .eq('modalidade_id', modalityId)
          .eq('atleta_id', currentAthleteId)
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
              atleta_id: currentAthleteId,
              ...scoreData,
              ...commonFields
            });
        }
      };
      
      // If this is a team modality and we have team members, save the score for all team members
      if (isTeamModality && teamMembers && teamMembers.length > 0) {
        for (const member of teamMembers) {
          await saveScore(member.id);
        }
      } else {
        // Just save for the current athlete
        await saveScore(athleteId);
      }
      
      // Calculate positions after saving scores
      await calculatePositions();
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['score', athleteId, modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['athletes', modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['modality-rankings', modalityId, eventId] });
      toast.success("A pontuação foi registrada com sucesso");
    },
    onError: (error) => {
      console.error('Error submitting score:', error);
      toast.error("Não foi possível registrar a pontuação");
    }
  });

  const onSubmit = (data: ScoreFormValues) => {
    submitScoreMutation.mutate(data);
  };

  if (!modality) {
    return (
      <Card>
        <CardContent className="py-4">
          <p className="text-center text-muted-foreground">Carregando detalhes da modalidade...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registrar {isTeamModality ? 'Pontuação da Equipe' : 'Pontuação'}</CardTitle>
              <CardDescription>
                Modalidade: {modality.modalidade_nome}
                {isTeamModality && (
                  <span className="ml-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Coletiva
                    </Badge>
                  </span>
                )}
              </CardDescription>
            </div>
            <div>
              <Badge 
                variant="secondary"
                className="ml-2 capitalize"
              >
                {scoreType === 'time' && 'Tempo'}
                {scoreType === 'distance' && 'Distância'}
                {scoreType === 'points' && 'Pontos'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {isTeamModality && teamMembers && teamMembers.length > 0 && (
                <div className="bg-muted/50 p-3 rounded-md mb-4">
                  <p className="text-sm font-medium mb-2">Membros da equipe ({teamMembers.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {teamMembers.map(member => (
                      <Badge key={member.id} variant="outline" className="bg-white">
                        {member.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    A pontuação será registrada para todos os membros da equipe.
                  </p>
                </div>
              )}
              
              {scoreType === 'time' ? (
                <ScoreInputField
                  form={form}
                  name="time"
                  label="Tempo"
                  scoreType="time"
                />
              ) : (
                <ScoreInputField
                  form={form}
                  name="score"
                  label={scoreType === 'distance' ? 'Distância' : 'Pontuação'}
                  scoreType={scoreType}
                  placeholder={scoreType === 'distance' ? '0.00' : '0'}
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
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator />
              
              <Button 
                type="submit"
                disabled={submitScoreMutation.isPending}
                className="w-full"
              >
                {submitScoreMutation.isPending ? 'Enviando...' : 'Salvar Pontuação'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <ModalityRankings 
        modalityId={modalityId}
        eventId={eventId}
        scoreType={scoreType}
      />
    </div>
  );
}
