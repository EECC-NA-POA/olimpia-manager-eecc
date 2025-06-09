
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Edit, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Athlete } from '../hooks/useAthletes';

interface AthletesTableProps {
  athletes: Athlete[];
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType: 'tempo' | 'distancia' | 'pontos';
  modalityRule?: any;
}

interface ScoreEntry {
  athleteId: string;
  value: string;
  notes: string;
  isEditing: boolean;
}

export function AthletesTable({
  athletes,
  modalityId,
  eventId,
  judgeId,
  scoreType,
  modalityRule
}: AthletesTableProps) {
  const queryClient = useQueryClient();
  const [scoreEntries, setScoreEntries] = useState<Record<string, ScoreEntry>>({});

  // Fetch existing scores
  const { data: existingScores = [] } = useQuery({
    queryKey: ['athlete-scores', modalityId, eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('*')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .in('atleta_id', athletes.map(a => a.atleta_id));
      
      if (error) {
        console.error('Error fetching scores:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!eventId && athletes.length > 0,
  });

  // Score submission mutation
  const submitScoreMutation = useMutation({
    mutationFn: async ({ athleteId, value, notes }: { athleteId: string; value: string; notes: string }) => {
      if (!eventId) throw new Error('Event ID is required');
      
      const athlete = athletes.find(a => a.atleta_id === athleteId);
      if (!athlete) throw new Error('Athlete not found');

      // Convert value based on score type
      let processedValue: number;
      if (scoreType === 'tempo') {
        // Assuming time format MM:SS.mmm
        const timeParts = value.split(':');
        if (timeParts.length === 2) {
          const minutes = parseInt(timeParts[0]) || 0;
          const seconds = parseFloat(timeParts[1]) || 0;
          processedValue = minutes * 60 + seconds;
        } else {
          processedValue = parseFloat(value) || 0;
        }
      } else {
        processedValue = parseFloat(value) || 0;
      }

      const { data, error } = await supabase
        .from('pontuacoes')
        .upsert({
          evento_id: eventId,
          modalidade_id: modalityId,
          atleta_id: athleteId,
          equipe_id: athlete.equipe_id,
          juiz_id: judgeId,
          valor_pontuacao: processedValue,
          observacoes: notes || null,
          tipo_pontuacao: scoreType,
        }, {
          onConflict: 'evento_id,modalidade_id,atleta_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-scores', modalityId, eventId] });
      toast.success('Pontuação salva com sucesso!');
    },
    onError: (error) => {
      console.error('Error saving score:', error);
      toast.error('Erro ao salvar pontuação');
    },
  });

  const startEditing = (athleteId: string) => {
    const existingScore = existingScores.find(s => s.atleta_id === athleteId);
    setScoreEntries(prev => ({
      ...prev,
      [athleteId]: {
        athleteId,
        value: existingScore ? formatScoreValue(existingScore.valor_pontuacao, scoreType) : '',
        notes: existingScore?.observacoes || '',
        isEditing: true,
      }
    }));
  };

  const cancelEditing = (athleteId: string) => {
    setScoreEntries(prev => {
      const newEntries = { ...prev };
      delete newEntries[athleteId];
      return newEntries;
    });
  };

  const saveScore = async (athleteId: string) => {
    const entry = scoreEntries[athleteId];
    if (!entry || !entry.value.trim()) {
      toast.error('Valor da pontuação é obrigatório');
      return;
    }

    try {
      await submitScoreMutation.mutateAsync({
        athleteId,
        value: entry.value,
        notes: entry.notes,
      });
      cancelEditing(athleteId);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const updateEntry = (athleteId: string, field: keyof ScoreEntry, value: string) => {
    setScoreEntries(prev => ({
      ...prev,
      [athleteId]: {
        ...prev[athleteId],
        [field]: value,
      }
    }));
  };

  const formatScoreValue = (value: number, type: string): string => {
    if (type === 'tempo') {
      const minutes = Math.floor(value / 60);
      const seconds = (value % 60).toFixed(3);
      return `${minutes.toString().padStart(2, '0')}:${seconds.padStart(6, '0')}`;
    }
    return value.toString();
  };

  const getScoreTypeLabel = () => {
    switch (scoreType) {
      case 'tempo': return 'Tempo (MM:SS.mmm)';
      case 'distancia': return 'Distância (m)';
      case 'pontos': return 'Pontos';
      default: return 'Pontuação';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Registro de Pontuações</h3>
        <Badge variant="outline">{getScoreTypeLabel()}</Badge>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Atleta</TableHead>
              <TableHead>Equipe</TableHead>
              <TableHead>{getScoreTypeLabel()}</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {athletes.map((athlete) => {
              const existingScore = existingScores.find(s => s.atleta_id === athlete.atleta_id);
              const entry = scoreEntries[athlete.atleta_id];
              const isEditing = entry?.isEditing || false;

              return (
                <TableRow key={athlete.atleta_id}>
                  <TableCell className="font-medium">
                    {athlete.atleta_nome}
                  </TableCell>
                  <TableCell>
                    {athlete.equipe_nome || '-'}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={entry.value}
                        onChange={(e) => updateEntry(athlete.atleta_id, 'value', e.target.value)}
                        placeholder={scoreType === 'tempo' ? '00:30.000' : '0'}
                        className="w-32"
                      />
                    ) : (
                      <span className={existingScore ? 'font-medium' : 'text-muted-foreground'}>
                        {existingScore 
                          ? formatScoreValue(existingScore.valor_pontuacao, scoreType)
                          : 'Não avaliado'
                        }
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Textarea
                        value={entry.notes}
                        onChange={(e) => updateEntry(athlete.atleta_id, 'notes', e.target.value)}
                        placeholder="Observações..."
                        className="w-48 h-8 resize-none"
                        rows={1}
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {existingScore?.observacoes || '-'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {existingScore ? (
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                        Avaliado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
                        Pendente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => saveScore(athlete.atleta_id)}
                          disabled={submitScoreMutation.isPending}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelEditing(athlete.atleta_id)}
                          disabled={submitScoreMutation.isPending}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditing(athlete.atleta_id)}
                        className="h-8 w-8 p-0"
                      >
                        {existingScore ? <Edit className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {athletes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum atleta inscrito nesta modalidade</p>
        </div>
      )}
    </div>
  );
}
