
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
          <TableHead key={campo.chave_campo} className="text-center min-w-[120px]">
            <div className="flex flex-col items-center">
              <span className="font-medium">{campo.rotulo_campo}</span>
              {campo.obrigatorio && <span className="text-red-500 text-xs">*obrigatório</span>}
              <span className="text-xs text-muted-foreground">({campo.tipo_input})</span>
            </div>
          </TableHead>
        ))}
        <TableHead className="w-[100px]">Status</TableHead>
        <TableHead className="w-[120px]">Ações</TableHead>
      </TableRow>
    </TableHeader>
  );
}
