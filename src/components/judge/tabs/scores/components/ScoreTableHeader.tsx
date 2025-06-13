
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ScoreTableHeaderProps {
  scoreType: 'tempo' | 'distancia' | 'pontos';
  showNotesColumn?: boolean;
}

export function ScoreTableHeader({ scoreType, showNotesColumn = false }: ScoreTableHeaderProps) {
  const getScoreColumnName = () => {
    switch (scoreType) {
      case 'tempo':
        return 'Tempo';
      case 'distancia':
        return 'Distância';
      case 'pontos':
      default:
        return 'Pontuação';
    }
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead>Atleta</TableHead>
        <TableHead>Filial</TableHead>
        <TableHead>{getScoreColumnName()}</TableHead>
        <TableHead>Observações</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Ações</TableHead>
        {showNotesColumn && <TableHead className="w-[100px]">Notas</TableHead>}
      </TableRow>
    </TableHeader>
  );
}
