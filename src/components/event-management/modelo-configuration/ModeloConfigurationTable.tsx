
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Check, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ModeloConfigurationTableProps {
  modelos: any[];
  onConfigure: (modelo: any) => void;
}

export function ModeloConfigurationTable({ modelos, onConfigure }: ModeloConfigurationTableProps) {
  if (modelos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhum modelo de pontuação encontrado para as modalidades deste evento.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Modalidade</TableHead>
          <TableHead>Modelo</TableHead>
          <TableHead>Usa Baterias</TableHead>
          <TableHead>Parâmetros</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {modelos.map((modelo) => {
          const parametros = modelo.parametros || {};
          const usaBaterias = parametros.baterias === true;
          
          return (
            <TableRow key={modelo.id}>
              <TableCell className="font-medium">
                {modelo.modalidade?.nome || 'N/A'}
              </TableCell>
              <TableCell>
                {modelo.codigo_modelo || modelo.descricao}
              </TableCell>
              <TableCell>
                {usaBaterias ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Sim
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <X className="h-3 w-3 mr-1" />
                    Não
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="text-xs text-muted-foreground">
                  {Object.keys(parametros).length > 0 ? (
                    <span>{Object.keys(parametros).length} configuração(ões)</span>
                  ) : (
                    <span>Sem configurações</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onConfigure(modelo)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Configurar
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
