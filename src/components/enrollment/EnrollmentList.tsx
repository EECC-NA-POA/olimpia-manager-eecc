
import React from 'react';
import { format, isValid, parseISO } from "date-fns";
import { Loader2, MessageCircle } from "lucide-react";
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
import { useModalitiesWithRepresentatives } from "@/hooks/useModalityRepresentatives";
import { useAuth } from "@/contexts/AuthContext";

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

const formatPhoneForWhatsApp = (phone: string) => {
  // Remove all non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');
  // Add country code if not present (assuming Brazil +55)
  if (cleanPhone.length === 11 && !cleanPhone.startsWith('55')) {
    return `55${cleanPhone}`;
  }
  return cleanPhone;
};

export const EnrollmentList = ({ 
  registeredModalities, 
  withdrawMutation 
}: EnrollmentListProps) => {
  const { user } = useAuth();
  const currentEventId = localStorage.getItem('currentEventId');
  
  // Get user's filial_id from their profile
  const userFilialId = user?.user_metadata?.filial_id;
  
  const { data: modalitiesWithRepresentatives } = useModalitiesWithRepresentatives(
    userFilialId, 
    currentEventId
  );

  const getRepresentativeForModality = (modalityId: number) => {
    return modalitiesWithRepresentatives?.find(m => m.id === modalityId)?.representative;
  };

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
            <TableHead className="font-semibold">Representante</TableHead>
            <TableHead className="font-semibold">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registeredModalities?.map((registration) => {
            const representative = getRepresentativeForModality(registration.modalidade?.id);
            
            return (
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
                  {representative ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-gray-900">
                        {representative.nome_completo}
                      </span>
                      {representative.telefone && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">
                            {representative.telefone}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => window.open(
                              `https://wa.me/${formatPhoneForWhatsApp(representative.telefone)}`,
                              '_blank'
                            )}
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            WhatsApp
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">
                      Não definido
                    </span>
                  )}
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
