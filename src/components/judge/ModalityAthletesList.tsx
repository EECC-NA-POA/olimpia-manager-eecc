
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ModalityAthletesListProps {
  modalityId: number;
  eventId: string | null;
  onAthleteSelect: (athleteId: string) => void;
  selectedAthleteId: string | null;
}

interface Athlete {
  atleta_id: string;
  atleta_nome: string;
  atleta_telefone?: string;
  atleta_email?: string;
  tipo_documento: string;
  numero_documento: string;
}

export function ModalityAthletesList({ 
  modalityId, 
  eventId, 
  onAthleteSelect,
  selectedAthleteId
}: ModalityAthletesListProps) {
  // Fetch athletes for the selected modality
  const { data: athletes, isLoading } = useQuery({
    queryKey: ['athletes', modalityId, eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('inscricoes_modalidades')
        .select(`
          atleta_id,
          usuarios(
            nome_completo,
            tipo_documento,
            numero_documento
          )
        `)
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .order('atleta_id');
      
      if (error) {
        console.error('Error fetching athletes:', error);
        toast.error('Não foi possível carregar os atletas');
        return [];
      }
      
      // Transform the data to match the Athlete interface
      return data.map((item: any) => ({
        atleta_id: item.atleta_id,
        atleta_nome: item.usuarios?.nome_completo || 'Atleta',
        tipo_documento: item.usuarios?.tipo_documento || 'N/A',
        numero_documento: item.usuarios?.numero_documento || 'N/A',
      })) as Athlete[];
    },
    enabled: !!eventId && !!modalityId,
  });

  // Fetch existing scores for this modality to show completed evaluations
  const { data: existingScores } = useQuery({
    queryKey: ['scores', modalityId, eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('atleta_id, valor_pontuacao, posicao_final, medalha')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId);
      
      if (error) {
        console.error('Error fetching scores:', error);
        return [];
      }
      
      return data;
    },
    enabled: !!eventId && !!modalityId,
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!athletes || athletes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum atleta inscrito nesta modalidade</p>
      </div>
    );
  }

  // Map athletes with their scores if available
  const athletesWithScores = athletes.map(athlete => {
    const score = existingScores?.find(s => s.atleta_id === athlete.atleta_id);
    return {
      ...athlete,
      hasScore: !!score,
      score: score?.valor_pontuacao,
      position: score?.posicao_final,
      medal: score?.medalha
    };
  });

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {athletesWithScores.map((athlete) => (
            <TableRow 
              key={athlete.atleta_id}
              className={`
                cursor-pointer hover:bg-muted 
                ${selectedAthleteId === athlete.atleta_id ? 'bg-muted' : ''}
              `}
              onClick={() => onAthleteSelect(athlete.atleta_id)}
            >
              <TableCell className="font-medium">{athlete.atleta_nome}</TableCell>
              <TableCell>{athlete.tipo_documento}: {athlete.numero_documento}</TableCell>
              <TableCell>
                {athlete.hasScore ? (
                  <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                    Avaliado
                    {athlete.medal && ` - ${athlete.medal}`}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                    Pendente
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
