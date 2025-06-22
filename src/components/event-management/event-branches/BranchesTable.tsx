
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Branch } from './types';

interface BranchesTableProps {
  branches: Branch[];
  selectedBranches: Record<string, boolean>;
  onToggleBranch: (branchId: string) => void;
}

export function BranchesTable({ branches, selectedBranches, onToggleBranch }: BranchesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">Vincular</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Cidade</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {branches.map((branch) => (
          <TableRow key={branch.id}>
            <TableCell>
              <Checkbox 
                checked={!!selectedBranches[branch.id]} 
                onCheckedChange={() => onToggleBranch(branch.id)}
              />
            </TableCell>
            <TableCell>{branch.nome}</TableCell>
            <TableCell>{branch.cidade}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
