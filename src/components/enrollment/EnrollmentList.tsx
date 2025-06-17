
import React from 'react';
import { format, isValid, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusIndicator } from "./StatusIndicator";
import { UseMutationResult } from "@tanstack/react-query";
import { RegisteredModality } from "@/types/modality";

interface EnrollmentListProps {
  registeredModalities: RegisteredModality[];
  withdrawMutation: UseMutationResult<void, Error, number, unknown>;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Data não disponível";
  
  const parsedDate = parseISO(dateString);
  if (!isValid(parsedDate)) return "Data inválida";
  
  try {
    return format(parsedDate, "dd/MM/yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Data inválida";
  }
};

export const EnrollmentList = ({ 
  registeredModalities, 
  withdrawMutation 
}: EnrollmentListProps) => {
  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-olimpics-green-primary/5 hover:bg-olimpics-green-primary/10">
            <TableHead className="font-semibold">Modalidade</TableHead>
            <TableHead className="font-semibold">Tipo</TableHead>
            <TableHead className="font-semibold">Categoria</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Data de Inscrição</TableHead>
            <TableHead className="font-semibold">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registeredModalities?.map((registration) => (
            <TableRow 
              key={registration.id}
              className="transition-colors hover:bg-gray-50"
            >
              <TableCell className="font-medium">{registration.modalidade?.nome}</TableCell>
              <TableCell className="capitalize">{registration.modalidade?.tipo_modalidade}</TableCell>
              <TableCell className="capitalize">{registration.modalidade?.categoria}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <StatusIndicator status={registration.status} />
                  <span className="capitalize">{registration.status}</span>
                </div>
              </TableCell>
              <TableCell>
                {formatDate(registration.data_inscricao)}
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={registration.status !== 'pendente' || withdrawMutation.isPending}
                  onClick={() => withdrawMutation.mutate(registration.id)}
                  className="transition-all duration-200 hover:bg-red-600"
                >
                  {withdrawMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Desistir"
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
