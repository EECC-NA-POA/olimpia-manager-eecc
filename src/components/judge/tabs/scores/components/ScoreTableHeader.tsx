
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ScoreTableHeaderProps {
  scoreType: 'tempo' | 'distancia' | 'pontos';
}

export function ScoreTableHeader({ scoreType }: ScoreTableHeaderProps) {
  const getScoreTypeLabel = () => {
    switch (scoreType) {
      case 'tempo': return 'Tempo (MM:SS.mmm)';
      case 'distancia': return 'Distância (m)';
      case 'pontos': return 'Pontos';
      default: return 'Pontuação';
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Registro de Pontuações</h3>
        <Badge variant="outline">{getScoreTypeLabel()}</Badge>
      </div>
      
      <TableHeader>
        <TableRow>
          <TableHead>Atleta</TableHead>
          <TableHead>Filial</TableHead>
          <TableHead>{getScoreTypeLabel()}</TableHead>
          <TableHead>Observações</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[120px]">Ações</TableHead>
        </TableRow>
      </TableHeader>
    </>
  );
}
