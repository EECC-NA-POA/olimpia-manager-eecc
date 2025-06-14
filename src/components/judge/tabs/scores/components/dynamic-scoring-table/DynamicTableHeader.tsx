
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CampoModelo } from '@/types/dynamicScoring';

interface DynamicTableHeaderProps {
  campos: CampoModelo[];
}

export function DynamicTableHeader({ campos }: DynamicTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[200px]">Atleta</TableHead>
        <TableHead className="w-[150px]">Filial</TableHead>
        
        {campos.map((campo) => (
          <TableHead key={campo.id} className="text-center min-w-[120px]">
            {campo.rotulo_campo}
            {campo.obrigatorio && <span className="text-red-500 ml-1">*</span>}
          </TableHead>
        ))}
        
        <TableHead className="w-[120px] text-center">Ações</TableHead>
      </TableRow>
    </TableHeader>
  );
}
