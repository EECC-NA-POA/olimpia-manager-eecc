
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { AthleteScoreCard } from '../score-card';
import { toast } from 'sonner';
import { Modality } from '@/lib/types/database';

interface ScoresTabProps {
  userId: string;
  eventId: string | null;
}

interface UserInfo {
  nome_completo?: string;
  tipo_documento?: string;
  numero_documento?: string;
  numero_identificador?: string | null;
}

interface Athlete {
  inscricao_id: number;
  atleta_id: string;
  atleta_nome: string;
  tipo_documento: string;
  numero_documento: string;
  numero_identificador?: string | null;
  equipe_id?: number | null;
}

export function ScoresTab({ userId, eventId }: ScoresTabProps) {
  const [selectedModalityId, setSelectedModalityId] = useState<number | null>(null);

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

  // Fetch athletes when a modality is selected
  const { data: athletes, isLoading: isLoadingAthletes } = useQuery({
    queryKey: ['athletes', selectedModalityId, eventId],
    queryFn: async () => {
      if (!selectedModalityId || !eventId) return [];

      const { data, error } = await supabase
        .from('inscricoes_modalidades')
        .select(`
          id,
          atleta_id,
          usuarios:atleta_id (
            nome_completo,
            tipo_documento,
            numero_documento,
            numero_identificador
          ),
          equipe_id
        `)
        .eq('modalidade_id', selectedModalityId)
        .eq('evento_id', eventId)
        .eq('status', 'confirmado');

      if (error) {
        console.error('Error fetching athletes:', error);
        toast.error('Não foi possível carregar os atletas');
        return [];
      }

      return data.map((item) => {
        // Ensure that we access usuarios as a properly typed object
        const userInfo: UserInfo = item.usuarios as UserInfo || {};
        
        return {
          inscricao_id: item.id,
          atleta_id: item.atleta_id,
          atleta_nome: userInfo?.nome_completo || 'Atleta',
          tipo_documento: userInfo?.tipo_documento || 'Documento',
          numero_documento: userInfo?.numero_documento || '',
          numero_identificador: userInfo?.numero_identificador,
          equipe_id: item.equipe_id
        };
      }) as Athlete[];
    },
    enabled: !!selectedModalityId && !!eventId,
  });

  // Handle modality selection
  const handleModalityChange = (value: string) => {
    setSelectedModalityId(Number(value));
  };

  // Get selected modality
  const selectedModality = modalities?.find(m => m.modalidade_id === selectedModalityId);

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
          <CardTitle>Registrar Pontuações Individuais</CardTitle>
          <CardDescription>
            Selecione uma modalidade para visualizar os atletas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Modalidade</label>
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
          </div>
        </CardContent>
      </Card>
      
      {selectedModalityId && (
        <>
          {isLoadingAthletes ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : athletes && athletes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {athletes.map((athlete) => (
                <AthleteScoreCard 
                  key={athlete.atleta_id}
                  athlete={athlete}
                  modalityId={selectedModalityId}
                  eventId={eventId}
                  judgeId={userId}
                  scoreType={selectedModality?.tipo_pontuacao || 'points'}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-6">
                <p className="text-center text-muted-foreground">
                  Nenhum atleta encontrado para esta modalidade
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
