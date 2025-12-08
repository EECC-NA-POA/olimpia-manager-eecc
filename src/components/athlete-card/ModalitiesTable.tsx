
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AthleteModality } from "@/lib/api";
import { UserCheck } from "lucide-react";

interface ModalitiesTableProps {
  modalidades: AthleteModality[];
  justifications: Record<string, string>;
  isUpdating: Record<string, boolean>;
  modalityStatuses: Record<string, string>;
  getStatusBadgeStyle: (status: string) => string;
  onJustificationChange: (modalityId: string, value: string) => void;
  onStatusChange: (modalityId: string, status: string) => void;
  readOnly?: boolean;
}

const getTipoInscricaoLabel = (tipo: string | null | undefined): string => {
  if (!tipo) return '';
  switch (tipo) {
    case 'organizador':
      return 'Organizador';
    case 'delegacao':
      return 'Delegação';
    default:
      return tipo;
  }
};

export const ModalitiesTable: React.FC<ModalitiesTableProps> = ({
  modalidades,
  justifications,
  isUpdating,
  modalityStatuses,
  getStatusBadgeStyle,
  onJustificationChange,
  onStatusChange,
  readOnly
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Modalidade</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Inscrito por</TableHead>
          <TableHead>Justificativa</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {modalidades.map((modalidade) => (
          <TableRow key={modalidade.id}>
            <TableCell>{modalidade.modalidade}</TableCell>
            <TableCell>
              <Badge className={cn("capitalize", getStatusBadgeStyle(modalityStatuses[modalidade.id] || modalidade.status))}>
                {modalityStatuses[modalidade.id] || modalidade.status}
              </Badge>
            </TableCell>
            <TableCell>
              {modalidade.tipo_inscricao ? (
                <div className="flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm">
                    {modalidade.inscrito_por_nome || 'Usuário'} 
                    <Badge variant="outline" className="ml-1.5 text-xs">
                      {getTipoInscricaoLabel(modalidade.tipo_inscricao)}
                    </Badge>
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">Próprio atleta</span>
              )}
            </TableCell>
            <TableCell>
            <Input
              placeholder="Justificativa para alteração"
              value={justifications[modalidade.id] || ''}
              onChange={(e) => onJustificationChange(modalidade.id, e.target.value)}
              disabled={!!readOnly}
            />
            </TableCell>
            <TableCell>
              <Select
                value={modalityStatuses[modalidade.id] || modalidade.status}
                onValueChange={(value) => onStatusChange(modalidade.id, value)}
                disabled={!!readOnly || !justifications[modalidade.id] || isUpdating[modalidade.id]}
              >
                <SelectTrigger className={cn(
                  "w-[180px]",
                  ((!!readOnly) || !justifications[modalidade.id] || isUpdating[modalidade.id]) && "opacity-50 cursor-not-allowed"
                )}>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

