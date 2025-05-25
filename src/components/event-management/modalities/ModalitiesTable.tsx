
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
import { Modality } from '../types';

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
            <TableHead>Tipo Modalidade</TableHead>
            <TableHead>Tipo Pontuação</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Faixa Etária</TableHead>
            <TableHead>Vagas</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Grupo</TableHead>
            <TableHead className="w-24">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={9} className="text-center py-4">
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
          <TableHead>Tipo Modalidade</TableHead>
          <TableHead>Tipo Pontuação</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Faixa Etária</TableHead>
          <TableHead>Vagas</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Grupo</TableHead>
          <TableHead className="w-24">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {modalities.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.nome}</TableCell>
            <TableCell>
              {item.tipo_modalidade === 'individual' ? 'Individual' : 'Coletivo'}
            </TableCell>
            <TableCell>
              {item.tipo_pontuacao === 'tempo' ? 'Tempo' : 
               item.tipo_pontuacao === 'distancia' ? 'Distância' : 'Pontos'}
            </TableCell>
            <TableCell>
              {item.categoria === 'masculino' ? 'Masculino' : 
               item.categoria === 'feminino' ? 'Feminino' : 'Misto'}
            </TableCell>
            <TableCell>
              {item.faixa_etaria === 'adulto' ? 'Adulto' : 'Infantil'}
            </TableCell>
            <TableCell>{item.vagas_ocupadas}/{item.limite_vagas}</TableCell>
            <TableCell>
              <Badge variant={
                item.status === 'Ativa' ? "default" : 
                item.status === 'Em análise' ? "secondary" :
                item.status === 'Esgotada' ? "destructive" : "outline"
              }>
                {item.status}
              </Badge>
            </TableCell>
            <TableCell>{item.grupo || '-'}</TableCell>
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
