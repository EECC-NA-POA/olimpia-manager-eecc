
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useCamposModelo } from '@/hooks/useDynamicScoring';
import { DynamicAthleteScoreCard } from '../../../score-card/DynamicAthleteScoreCard';
import { Athlete } from '../hooks/useAthletes';
import { ModeloModalidade } from '@/types/dynamicScoring';

interface DynamicAthletesTableProps {
  athletes: Athlete[];
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  modelo: ModeloModalidade;
}

export function DynamicAthletesTable({
  athletes,
  modalityId,
  eventId,
  judgeId,
  modelo
}: DynamicAthletesTableProps) {
  const { data: campos = [], isLoading: isLoadingCampos } = useCamposModelo(modelo.id);

  // Fetch existing scores for all athletes
  const { data: existingScores = [] } = useQuery({
    queryKey: ['dynamic-scores', modalityId, eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('pontuacoes')
        .select(`
          *,
          tentativas_pontuacao (
            chave_campo,
            valor
          )
        `)
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('modelo_id', modelo.id)
        .in('atleta_id', athletes.map(a => a.atleta_id));
      
      if (error) {
        console.error('Error fetching dynamic scores:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!eventId && athletes.length > 0,
  });

  if (isLoadingCampos) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Carregando configuração dos campos...</p>
      </div>
    );
  }

  if (campos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum campo configurado para esta modalidade</p>
        <p className="text-xs mt-2 text-muted-foreground">
          Configure os campos na seção "Modelos de Pontuação" do evento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Atleta</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Filial</TableHead>
              {campos
                .sort((a, b) => a.ordem_exibicao - b.ordem_exibicao)
                .map(campo => (
                  <TableHead key={campo.id}>{campo.rotulo_campo}</TableHead>
                ))}
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {athletes.map((athlete) => {
              const athleteScore = existingScores.find(s => s.atleta_id === athlete.atleta_id);
              const tentativas = athleteScore?.tentativas_pontuacao || [];
              
              return (
                <TableRow key={athlete.atleta_id}>
                  <TableCell className="font-medium">
                    {athlete.atleta_nome}
                  </TableCell>
                  <TableCell>
                    {athlete.tipo_documento}: {athlete.numero_documento}
                  </TableCell>
                  <TableCell>
                    {athlete.filial_nome || '-'}
                  </TableCell>
                  {campos
                    .sort((a, b) => a.ordem_exibicao - b.ordem_exibicao)
                    .map(campo => {
                      const tentativa = tentativas.find(t => t.chave_campo === campo.chave_campo);
                      return (
                        <TableCell key={campo.id}>
                          {tentativa ? tentativa.valor : '-'}
                        </TableCell>
                      );
                    })}
                  <TableCell>
                    {athleteScore ? (
                      <span className="text-green-600 font-medium">✓ Pontuado</span>
                    ) : (
                      <span className="text-muted-foreground">Pendente</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DynamicAthleteScoreCard
                      athlete={athlete}
                      modalityId={modalityId}
                      eventId={eventId}
                      judgeId={judgeId}
                      scoreType="pontos"
                    />
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
