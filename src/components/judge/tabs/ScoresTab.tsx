
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { ModalityAthletesList } from '@/components/judge/ModalityAthletesList';
import { AthleteScoreForm } from '@/components/judge/AthleteScoreForm';
import { toast } from 'sonner';
import { Modality } from '@/lib/types/database';

interface ScoresTabProps {
  userId: string;
  eventId: string | null;
}

export function ScoresTab({ userId, eventId }: ScoresTabProps) {
  const [selectedModalityId, setSelectedModalityId] = useState<number | null>(null);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);

  // Fetch modalities
  const { data: modalities, isLoading: isLoadingModalities } = useQuery({
    queryKey: ['modalities', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      // Get modalities with confirmed athlete enrollments
      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, categoria, tipo_modalidade, tipo_pontuacao')
        .eq('evento_id', eventId)
        .order('nome')
        .limit(100);
      
      if (error) {
        console.error('Error fetching modalities:', error);
        toast.error('Não foi possível carregar as modalidades');
        return [];
      }
      
      return data.map(m => ({
        modalidade_id: m.id,
        modalidade_nome: m.nome,
        categoria: m.categoria,
        tipo_modalidade: m.tipo_modalidade,
        tipo_pontuacao: m.tipo_pontuacao || 'points'
      })) as Modality[];
    },
    enabled: !!eventId,
  });

  // Handle modality selection
  const handleModalityChange = (value: string) => {
    setSelectedModalityId(Number(value));
    setSelectedAthleteId(null); // Reset athlete selection when modality changes
  };

  // Handle athlete selection
  const handleAthleteSelect = (athleteId: string) => {
    setSelectedAthleteId(athleteId);
  };

  if (isLoadingModalities) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!modalities || modalities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhuma modalidade disponível</CardTitle>
          <CardDescription>
            Não existem modalidades com atletas confirmados para este evento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const selectedModality = modalities.find(m => m.modalidade_id === selectedModalityId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Pontuações</CardTitle>
          <CardDescription>
            Selecione uma modalidade e um atleta para registrar pontuações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Modalidade</label>
              <Select onValueChange={handleModalityChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma modalidade" />
                </SelectTrigger>
                <SelectContent>
                  {modalities.map((modality) => (
                    <SelectItem 
                      key={modality.modalidade_id} 
                      value={modality.modalidade_id.toString()}
                    >
                      {modality.modalidade_nome} - {modality.categoria}
                      {' '}
                      <span className="text-muted-foreground text-xs ml-1">
                        ({modality.tipo_pontuacao === 'time' ? 'Tempo' : 
                          modality.tipo_pontuacao === 'distance' ? 'Distância' : 'Pontos'})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedModalityId && (
              <ModalityAthletesList 
                modalityId={selectedModalityId} 
                eventId={eventId}
                onAthleteSelect={handleAthleteSelect}
                selectedAthleteId={selectedAthleteId}
              />
            )}
            
            {selectedAthleteId && selectedModalityId && (
              <AthleteScoreForm 
                athleteId={selectedAthleteId}
                modalityId={selectedModalityId}
                eventId={eventId}
                judgeId={userId}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
