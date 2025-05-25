
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
import { Modality } from './types';

interface ModalityRulesTableProps {
  modalities: Modality[];
  onEdit: (modalityId: string) => void;
  onDelete: (modalityId: string) => void;
}

export function ModalityRulesTable({ modalities, onEdit, onDelete }: ModalityRulesTableProps) {
  if (modalities.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Modalidade</TableHead>
            <TableHead>Tipo Modalidade</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Faixa Etária</TableHead>
            <TableHead>Tipo de Regra</TableHead>
            <TableHead>Parâmetros</TableHead>
            <TableHead>Status da Regra</TableHead>
            <TableHead className="w-24">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={8} className="text-center py-4">
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
          <TableHead>Modalidade</TableHead>
          <TableHead>Tipo Modalidade</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Faixa Etária</TableHead>
          <TableHead>Tipo de Regra</TableHead>
          <TableHead>Parâmetros</TableHead>
          <TableHead>Status da Regra</TableHead>
          <TableHead className="w-24">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {modalities.map((modality) => (
          <TableRow key={modality.id}>
            <TableCell className="font-medium">{modality.nome}</TableCell>
            <TableCell>
              {modality.tipo_modalidade === 'individual' ? 'Individual' : 'Coletivo'}
            </TableCell>
            <TableCell>
              {modality.categoria === 'masculino' ? 'Masculino' : 
               modality.categoria === 'feminino' ? 'Feminino' : 'Misto'}
            </TableCell>
            <TableCell>
              {modality.faixa_etaria === 'adulto' ? 'Adulto' : 'Infantil'}
            </TableCell>
            <TableCell>
              {modality.regra ? (
                <Badge variant="default">
                  {modality.regra.regra_tipo === 'pontos' ? 'Pontos' :
                   modality.regra.regra_tipo === 'distancia' ? 'Distância' :
                   modality.regra.regra_tipo === 'tempo' ? 'Tempo' :
                   modality.regra.regra_tipo === 'baterias' ? 'Baterias' :
                   modality.regra.regra_tipo === 'sets' ? 'Sets' :
                   modality.regra.regra_tipo === 'arrows' ? 'Flechas' :
                   modality.regra.regra_tipo}
                </Badge>
              ) : (
                <Badge variant="secondary">Não configurada</Badge>
              )}
            </TableCell>
            <TableCell>
              {modality.regra && (
                <div className="text-sm space-y-1">
                  {Object.entries(modality.regra.parametros).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium">{key}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </TableCell>
            <TableCell>
              <Badge variant={modality.regra ? "default" : "secondary"}>
                {modality.regra ? 'Configurada' : 'Pendente'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit(modality.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {modality.regra && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onDelete(modality.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
