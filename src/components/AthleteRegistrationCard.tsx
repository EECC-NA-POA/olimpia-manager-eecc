import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Building2, Award, MessageCircle, User, FileText, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AthleteRegistration } from '@/lib/api';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface AthleteRegistrationCardProps {
  registration: AthleteRegistration;
  onStatusChange: (modalityId: string, status: string, justification: string) => Promise<void>;
  onPaymentStatusChange?: (athleteId: string, status: string) => Promise<void>;
}

export const AthleteRegistrationCard: React.FC<AthleteRegistrationCardProps> = ({
  registration,
  onStatusChange,
  onPaymentStatusChange,
}) => {
  const [justifications, setJustifications] = React.useState<Record<string, string>>({});
  const isPaymentPending = registration.status_pagamento === "pendente";
  const hasModalities = registration.modalidades.length > 0;

  const handleWhatsAppClick = (phone: string) => {
    const formattedPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent('Olá! Gostaria de falar sobre sua inscrição nas Olimpíadas.');
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  const handleStatusChange = async (modalityId: string, newStatus: string) => {
    const justification = justifications[modalityId];
    if (!justification) {
      toast.error('É necessário fornecer uma justificativa para alterar o status.');
      return;
    }
    
    try {
      await onStatusChange(modalityId, newStatus, justification);
      toast.success('Status atualizado com sucesso!');
      setJustifications(prev => ({ ...prev, [modalityId]: '' }));
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handlePaymentStatusChange = async (newStatus: string) => {
    if (!onPaymentStatusChange) return;
    
    try {
      await onPaymentStatusChange(registration.id, newStatus);
      toast.success('Status de pagamento atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Erro ao atualizar status de pagamento');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmado':
        return 'border-l-4 border-l-green-500 bg-green-50';
      case 'pendente':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50';
      case 'rejeitado':
        return 'border-l-4 border-l-red-500 bg-red-50';
      case 'cancelado':
        return 'border-l-4 border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-4 border-l-gray-500 bg-gray-50';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmado':
        return 'text-green-700 bg-green-100';
      case 'pendente':
        return 'text-yellow-700 bg-yellow-100';
      case 'rejeitado':
        return 'text-red-700 bg-red-100';
      case 'cancelado':
        return 'text-gray-700 bg-gray-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const cardContent = (
    <Card className={cn(
      getStatusColor(registration.status_pagamento),
      isPaymentPending ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer hover:shadow-md transition-shadow'
    )}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">{registration.nome_atleta}</h3>
            <Badge className={cn("capitalize", getStatusTextColor(registration.status_pagamento))}>
              {registration.status_pagamento}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">
                {registration.email?.trim() ? registration.email : "Email não informado"}
              </span>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <Button
                      variant="link"
                      className="p-0 h-auto font-normal flex items-center gap-1 text-olimpics-orange-primary hover:text-olimpics-orange-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWhatsAppClick(registration.telefone);
                      }}
                    >
                      {registration.telefone}
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clique para abrir WhatsApp</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{registration.filial}</span>
            </div>

            {hasModalities && (
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span>{registration.modalidades.length} modalidades</span>
              </div>
            )}
          </div>

          {registration.status_pagamento === "pendente" && onPaymentStatusChange && (
            <div className="mt-4 flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Status do pagamento:</label>
              <Select onValueChange={handlePaymentStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Alterar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isPaymentPending) {
    return cardContent;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>{cardContent}</div>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Gerenciar Atleta</DialogTitle>
          <DialogDescription className="space-y-4">
            <div className="bg-muted/50 p-6 rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-lg">{registration.nome_atleta}</h4>
                <Badge className={cn("capitalize", getStatusTextColor(registration.status_pagamento))}>
                  {registration.status_pagamento}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{registration.nome_atleta}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{registration.documento || "Documento não informado"}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{registration.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <Button
                      variant="link"
                      className="p-0 h-auto font-normal text-olimpics-orange-primary hover:text-olimpics-orange-secondary"
                      onClick={() => handleWhatsAppClick(registration.telefone)}
                    >
                      {registration.telefone}
                    </Button>
                  </p>
                </div>
                
                <div className="space-y-3">
                  <p className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{registration.filial}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>Status do Pagamento: {registration.status_pagamento}</span>
                  </p>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        {hasModalities && (
          <>
            <Separator className="my-4" />
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-4">Modalidades Inscritas</h3>
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
                  {registration.modalidades.map((modalidade) => (
                    <TableRow key={modalidade.id}>
                      <TableCell>{modalidade.modalidade}</TableCell>
                      <TableCell>
                        <Badge className={cn("capitalize", getStatusTextColor(modalidade.status))}>
                          {modalidade.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Justificativa para alteração"
                          value={justifications[modalidade.id] || ''}
                          onChange={(e) => setJustifications(prev => ({
                            ...prev,
                            [modalidade.id]: e.target.value
                          }))}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={modalidade.status}
                          onValueChange={(value) => handleStatusChange(modalidade.id, value)}
                          disabled={!justifications[modalidade.id]}
                        >
                          <SelectTrigger className={cn(
                            "w-[180px]",
                            !justifications[modalidade.id] && "opacity-50 cursor-not-allowed"
                          )}>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendente">pendente</SelectItem>
                            <SelectItem value="confirmado">confirmado</SelectItem>
                            <SelectItem value="rejeitado">rejeitado</SelectItem>
                            <SelectItem value="cancelado">cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};