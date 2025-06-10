
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Check, X, ChevronUp, ChevronDown } from 'lucide-react';
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
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  onSort: (key: string) => void;
}

export function ModeloConfigurationTable({ 
  modelos, 
  onConfigure, 
  sortConfig, 
  onSort 
}: ModeloConfigurationTableProps) {
  console.log('ModeloConfigurationTable - modelos received:', modelos);

  const SortableHeader = ({ sortKey, children }: { sortKey: string; children: React.ReactNode }) => {
    const isActive = sortConfig?.key === sortKey;
    const direction = sortConfig?.direction;

    return (
      <TableHead 
        className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
        onClick={() => onSort(sortKey)}
      >
        <div className="flex items-center gap-2">
          {children}
          {isActive ? (
            direction === 'asc' ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )
          ) : (
            <div className="h-4 w-4" />
          )}
        </div>
      </TableHead>
    );
  };

  if (modelos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhum modelo de pontuação encontrado para os filtros aplicados.</p>
        <p className="text-sm mt-2">
          Tente ajustar os filtros ou certifique-se de que existem modelos configurados.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHeader sortKey="modalidade">Modalidade</SortableHeader>
          <SortableHeader sortKey="modelo">Modelo</SortableHeader>
          <SortableHeader sortKey="baterias">Usa Baterias</SortableHeader>
          <TableHead>Parâmetros</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {modelos.map((modelo) => {
          console.log('Rendering modelo:', modelo);
          const parametros = modelo.parametros || {};
          const usaBaterias = parametros.baterias === true;
          
          return (
            <TableRow key={modelo.id}>
              <TableCell className="font-medium">
                {modelo.modalidade?.nome || 'N/A'}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{modelo.codigo_modelo}</div>
                  {modelo.descricao && (
                    <div className="text-sm text-muted-foreground">{modelo.descricao}</div>
                  )}
                </div>
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
                <div className="text-xs text-muted-foreground space-y-1">
                  {Object.keys(parametros).length > 0 ? (
                    <div>
                      <div>{Object.keys(parametros).length} configuração(ões)</div>
                      <div className="text-xs">
                        {Object.entries(parametros).slice(0, 3).map(([key, value]) => (
                          <div key={key}>
                            <strong>{key}:</strong> {String(value)}
                          </div>
                        ))}
                        {Object.keys(parametros).length > 3 && (
                          <div>...</div>
                        )}
                      </div>
                    </div>
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
