
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AthleteModality } from "@/lib/api";

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
