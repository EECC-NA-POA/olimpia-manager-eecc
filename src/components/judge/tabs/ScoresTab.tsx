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
import { supabase } from '@/integrations/supabase/client';
import { ModalityAthletesList } from '@/components/judge/ModalityAthletesList';
import { AthleteScoreForm } from '@/components/judge/AthleteScoreForm';
import { toast } from '@/hooks/use-toast';

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
        .from('vw_modalidades_atletas_confirmados')
        .select('modalidade_id, modalidade_nome, categoria, tipo_modalidade')
        .eq('evento_id', eventId)
        .order('modalidade_nome')
        .limit(100);
      
      if (error) {
        console.error('Error fetching modalities:', error);
        toast({
          title: "Erro",
          description: 'Não foi possível carregar as modalidades',
          variant: "destructive"
        });
        return [];
      }
      
      // Remove duplicates (since the view joins with athletes)
      const uniqueModalities = data.reduce((acc, current) => {
        const x = acc.find(item => item.modalidade_id === current.modalidade_id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);
      
      return uniqueModalities;
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
