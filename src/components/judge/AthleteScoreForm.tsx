
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  CardTitle 
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
import { toast } from '@/hooks/use-toast';

const scoreSchema = z.object({
  score: z.number({ required_error: 'A pontuação é obrigatória' }),
  position: z.number().optional(),
  medal: z.string().optional(),
  notes: z.string().optional(),
});

interface ScoreFormValues extends z.infer<typeof scoreSchema> {}

interface AthleteScoreFormProps {
  athleteId: string;
  modalityId: number;
  eventId: string | null;
  judgeId: string;
}

export function AthleteScoreForm({ 
  athleteId, 
  modalityId, 
  eventId, 
  judgeId 
}: AthleteScoreFormProps) {
  const queryClient = useQueryClient();
  
  const form = useForm<ScoreFormValues>({
    resolver: zodResolver(scoreSchema),
    defaultValues: {
      score: 0,
      position: undefined,
      medal: undefined,
      notes: undefined,
    },
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
        .single();
      
      if (error) {
        console.error('Error fetching existing score:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!eventId && !!athleteId && !!modalityId,
  });

  // Set form values when existing score is loaded
  React.useEffect(() => {
    if (existingScore) {
      form.setValue('score', existingScore.valor_pontuacao);
      form.setValue('position', existingScore.posicao_final || undefined);
      form.setValue('medal', existingScore.medalha || undefined);
      form.setValue('notes', existingScore.observacoes || undefined);
    }
  }, [existingScore, form]);

  // Submit score mutation
  const submitScoreMutation = useMutation({
    mutationFn: async (data: ScoreFormValues) => {
      if (!eventId) throw new Error('Event ID is missing');
      
      // Check if score already exists
      const { data: existingScore, error: checkError } = await supabase
        .from('pontuacoes')
        .select('id')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('atleta_id', athleteId)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking existing score:', checkError);
        throw checkError;
      }
      
      if (existingScore) {
        // Update existing score
        const { error } = await supabase
          .from('pontuacoes')
          .update({
            valor_pontuacao: data.score,
            posicao_final: data.position || null,
            medalha: data.medal || null,
            observacoes: data.notes || null,
            juiz_id: judgeId,
            data_registro: new Date().toISOString()
          })
          .eq('id', existingScore.id);
        
        if (error) throw error;
      } else {
        // Insert new score
        const { error } = await supabase
          .from('pontuacoes')
          .insert({
            evento_id: eventId,
            modalidade_id: modalityId,
            atleta_id: athleteId,
            valor_pontuacao: data.score,
            posicao_final: data.position || null,
            medalha: data.medal || null,
            observacoes: data.notes || null,
            juiz_id: judgeId,
            unidade: 'pontos', // Default unit for scores
            data_registro: new Date().toISOString()
          });
        
        if (error) throw error;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['athletes', modalityId, eventId] });
      toast({
        description: "A pontuação foi registrada com sucesso"
      });
    },
    onError: (error) => {
      console.error('Error submitting score:', error);
      toast({
        description: "Não foi possível registrar a pontuação",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: ScoreFormValues) => {
    submitScoreMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Pontuação</CardTitle>
        <CardDescription>
          Informe a pontuação do atleta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pontuação</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posição</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="medal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medalha</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Nenhuma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ouro">Ouro</SelectItem>
                        <SelectItem value="prata">Prata</SelectItem>
                        <SelectItem value="bronze">Bronze</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="Observações adicionais" 
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
            >
              {submitScoreMutation.isPending ? 'Enviando...' : 'Salvar Pontuação'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
