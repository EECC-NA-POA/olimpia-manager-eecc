
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CampoModelo } from '@/types/dynamicScoring';
import { filterScoringFields } from '@/utils/dynamicScoringUtils';

interface DynamicTableHeaderProps {
  campos: CampoModelo[];
}

export function DynamicTableHeader({ campos }: DynamicTableHeaderProps) {
  // CRITICAL: Filter out configuration fields before rendering
  const scoringFields = filterScoringFields(campos);
  
  console.log('DynamicTableHeader - Filtering fields:', {
    originalCount: campos.length,
    filteredCount: scoringFields.length,
    originalFields: campos.map(c => ({ key: c.chave_campo, type: c.tipo_input })),
    scoringFields: scoringFields.map(c => ({ key: c.chave_campo, type: c.tipo_input }))
  });

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[200px]">Atleta</TableHead>
        <TableHead className="w-[150px]">Filial</TableHead>
        
        {scoringFields.map((campo) => (
          <TableHead key={campo.id} className="text-center min-w-[120px]">
            <div className="flex flex-col items-center">
              <span className="font-medium">{campo.rotulo_campo}</span>
              {campo.obrigatorio && <span className="text-red-500 text-xs">*obrigatório</span>}
            </div>
          </TableHead>
        ))}
        
        <TableHead className="w-[120px] text-center">Ações</TableHead>
      </TableRow>
    </TableHeader>
  );
}
