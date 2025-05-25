
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { Modality } from './hooks/useModalitiesData';

interface ModalitiesTableProps {
  modalities: Modality[];
  onEdit: (modality: Modality) => void;
  onDelete: (id: string) => void;
}

export function ModalitiesTable({ modalities, onEdit, onDelete }: ModalitiesTableProps) {
  if (modalities.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Gênero</TableHead>
            <TableHead>Faixa Etária</TableHead>
            <TableHead>Vagas</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={7} className="text-center py-4">
              Nenhuma modalidade encontrada
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Gênero</TableHead>
          <TableHead>Faixa Etária</TableHead>
          <TableHead>Vagas</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-24">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {modalities.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.nome}</TableCell>
            <TableCell>
              {item.tipo === 'INDIVIDUAL' ? 'Individual' : 
               item.tipo === 'EQUIPE' ? 'Equipe' : 
               item.tipo === 'DUPLA' ? 'Dupla' : item.tipo}
            </TableCell>
            <TableCell>
              {item.genero === 'MASCULINO' ? 'Masculino' : 
               item.genero === 'FEMININO' ? 'Feminino' : 'Misto'}
            </TableCell>
            <TableCell>
              {item.faixa_etaria_min}{item.faixa_etaria_max ? ` - ${item.faixa_etaria_max}` : '+'} anos
            </TableCell>
            <TableCell>{item.vagas}</TableCell>
            <TableCell>
              <Badge variant={item.is_ativo ? "default" : "secondary"}>
                {item.is_ativo ? 'Ativo' : 'Inativo'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onDelete(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
