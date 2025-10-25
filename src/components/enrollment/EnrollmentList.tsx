
import React from 'react';
import { format, isValid, parseISO } from "date-fns";
import { Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusIndicator } from "./StatusIndicator";
import { UseMutationResult } from "@tanstack/react-query";
import { RegisteredModality } from "@/types/modality";

interface EnrollmentListProps {
  registeredModalities: RegisteredModality[];
  withdrawMutation: UseMutationResult<void, Error, number, unknown>;
  modalitiesWithRepresentatives?: any[];
  readOnly?: boolean;
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
  if (cleanPhone.length === 10 && !cleanPhone.startsWith('55')) {
    return `55${cleanPhone}`;
  }
  
  return cleanPhone;
};

export const EnrollmentList = ({ 
  registeredModalities, 
  withdrawMutation,
  modalitiesWithRepresentatives = [],
  readOnly = false
}: EnrollmentListProps) => {
  const getRepresentativesForModality = (modalityId: number) => {
    const modality = modalitiesWithRepresentatives.find(m => m.id === modalityId);
    return modality?.representatives || [];
  };

  if (!registeredModalities || registeredModalities.length === 0) {
    return (
      <div className="text-center py-4 sm:py-6 lg:py-8 text-muted-foreground">
        <p className="text-sm sm:text-base">Você ainda não se inscreveu em nenhuma modalidade.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card Layout */}
      <div className="block sm:hidden space-y-3">
        {registeredModalities.map((registration) => {
          const representatives = getRepresentativesForModality(registration.modalidade?.id);
          
          return (
            <Card key={registration.id} className="border-l-4 border-l-olimpics-green-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">
                  {registration.modalidade?.nome}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="capitalize">{registration.modalidade?.tipo_modalidade}</span>
                  <span>•</span>
                  <span className="capitalize">{registration.modalidade?.categoria}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <StatusIndicator status={registration.status} />
                  <span className="capitalize text-sm">{registration.status}</span>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Inscrito em: {formatDate(registration.data_inscricao)}
                </div>

                {representatives && representatives.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-foreground">Representantes:</div>
                    {representatives.map((rep: any, index: number) => (
                      <div key={index} className="bg-muted p-2 rounded text-sm">
                        <div className="font-medium text-foreground">{rep.nome_completo}</div>
                        {rep.telefone && (
                          <a
                            href={`https://wa.me/${formatPhoneForWhatsApp(rep.telefone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-success hover:text-success/80 text-xs mt-1"
                          >
                            <Phone className="h-3 w-3" />
                            {rep.telefone}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant="destructive"
                  size="sm"
                  disabled={readOnly || registration.status !== 'pendente' || withdrawMutation.isPending}
                  onClick={() => withdrawMutation.mutate(registration.id)}
                  className="w-full"
                >
                  {withdrawMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    readOnly ? 'Indisponível' : 'Desistir'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden sm:block rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-olimpics-green-primary/5 hover:bg-olimpics-green-primary/10">
              <TableHead className="font-semibold">Modalidade</TableHead>
              <TableHead className="font-semibold">Tipo</TableHead>
              <TableHead className="font-semibold">Categoria</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Data de Inscrição</TableHead>
              <TableHead className="font-semibold">Representantes</TableHead>
              <TableHead className="font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registeredModalities.map((registration) => {
              const representatives = getRepresentativesForModality(registration.modalidade?.id);
              
              return (
                <TableRow 
                  key={registration.id}
                  className="transition-colors hover:bg-muted/50 text-foreground"
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
                    {representatives && representatives.length > 0 ? (
                      <div className="space-y-2">
                        {representatives.map((rep: any, index: number) => (
                          <div key={index} className="space-y-1">
                            <div className="font-medium text-sm text-foreground">
                              {rep.nome_completo}
                            </div>
                            {rep.telefone && (
                              <a
                                href={`https://wa.me/${formatPhoneForWhatsApp(rep.telefone)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-success hover:text-success/80 text-sm transition-colors"
                              >
                                <Phone className="h-3 w-3" />
                                {rep.telefone}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Não definido</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={readOnly || registration.status !== 'pendente' || withdrawMutation.isPending}
                      onClick={() => withdrawMutation.mutate(registration.id)}
                      className="transition-all duration-200 hover:bg-red-600"
                    >
                      {withdrawMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        readOnly ? 'Indisponível' : 'Desistir'
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
