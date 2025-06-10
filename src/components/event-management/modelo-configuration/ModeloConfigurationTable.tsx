
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Check, X, ChevronUp, ChevronDown, Clock, Ruler, Calculator, Target } from 'lucide-react';
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

  const getParametersSummary = (modelo: any) => {
    const parametros = modelo.parametros || {};
    const summaryItems = [];

    // Tipo de regra de pontuação
    if (parametros.regra_tipo) {
      let icon;
      let label;
      switch (parametros.regra_tipo) {
        case 'tempo':
          icon = <Clock className="h-3 w-3" />;
          label = 'Tempo';
          break;
        case 'distancia':
          icon = <Ruler className="h-3 w-3" />;
          label = 'Distância';
          break;
        case 'pontos':
          icon = <Target className="h-3 w-3" />;
          label = 'Pontos';
          break;
        default:
          icon = <Target className="h-3 w-3" />;
          label = parametros.regra_tipo;
      }
      
      summaryItems.push(
        <Badge key="regra_tipo" variant="outline" className="flex items-center gap-1">
          {icon}
          {label}
        </Badge>
      );
    }

    // Formato de resultado
    if (parametros.formato_resultado) {
      let formatLabel;
      switch (parametros.formato_resultado) {
        case 'tempo':
          formatLabel = 'MM:SS.mmm';
          break;
        case 'distancia':
          formatLabel = 'm,cm';
          break;
        case 'pontos':
          formatLabel = '###.##';
          break;
        default:
          formatLabel = parametros.formato_resultado;
      }
      
      summaryItems.push(
        <Badge key="formato" variant="secondary" className="text-xs">
          {formatLabel}
        </Badge>
      );
    }

    // Campo calculado
    if (parametros.tipo_calculo) {
      summaryItems.push(
        <Badge key="calculado" variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700">
          <Calculator className="h-3 w-3" />
          Calculado
        </Badge>
      );
    }

    // Contexto do cálculo
    if (parametros.contexto) {
      summaryItems.push(
        <Badge key="contexto" variant="secondary" className="text-xs">
          {parametros.contexto}
        </Badge>
      );
    }

    // Campo de referência
    if (parametros.campo_referencia) {
      summaryItems.push(
        <Badge key="referencia" variant="outline" className="text-xs">
          ref: {parametros.campo_referencia}
        </Badge>
      );
    }

    // Ordem de cálculo
    if (parametros.ordem_calculo) {
      const ordemLabel = parametros.ordem_calculo === 'asc' ? 'menor = melhor' : 'maior = melhor';
      summaryItems.push(
        <Badge key="ordem" variant="secondary" className="text-xs">
          {ordemLabel}
        </Badge>
      );
    }

    // Unidades
    if (parametros.unidade) {
      summaryItems.push(
        <Badge key="unidade" variant="outline" className="text-xs">
          {parametros.unidade}
        </Badge>
      );
    }

    if (parametros.subunidade) {
      summaryItems.push(
        <Badge key="subunidade" variant="secondary" className="text-xs">
          {parametros.subunidade}
        </Badge>
      );
    }

    // Configurações de bateria
    if (parametros.num_raias) {
      summaryItems.push(
        <Badge key="raias" variant="outline" className="text-xs">
          {parametros.num_raias} raias
        </Badge>
      );
    }

    if (parametros.permite_final) {
      summaryItems.push(
        <Badge key="final" variant="secondary" className="text-xs">
          Final permitida
        </Badge>
      );
    }

    return summaryItems;
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
          <TableHead>Configurações</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {modelos.map((modelo) => {
          console.log('Rendering modelo:', modelo);
          const parametros = modelo.parametros || {};
          const usaBaterias = parametros.baterias === true;
          const parametersSummary = getParametersSummary(modelo);
          
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
                <div className="flex flex-wrap gap-1 max-w-md">
                  {parametersSummary.length > 0 ? (
                    parametersSummary
                  ) : (
                    <span className="text-sm text-muted-foreground">Sem configurações</span>
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
