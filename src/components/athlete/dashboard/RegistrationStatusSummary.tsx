
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, Trophy, CreditCard } from "lucide-react";
import { RegisteredModality } from "@/types/modality";

interface RegistrationStatusSummaryProps {
  registeredModalities: RegisteredModality[];
  paymentStatus?: string;
  paymentAmount?: number;
}

export const RegistrationStatusSummary = ({ 
  registeredModalities,
  paymentStatus,
  paymentAmount 
}: RegistrationStatusSummaryProps) => {
  const totalEnrolled = registeredModalities.length;
  const confirmedCount = registeredModalities.filter(m => m.status === 'confirmada').length;
  const pendingCount = registeredModalities.filter(m => m.status === 'pendente').length;
  
  const isPaid = paymentStatus?.toLowerCase() === 'pago' || paymentStatus?.toLowerCase() === 'isento';
  const hasPendingPayment = !isPaid && totalEnrolled > 0;
  
  const getGeneralStatus = () => {
    if (totalEnrolled === 0) return 'empty';
    if (hasPendingPayment) return 'attention';
    if (pendingCount > 0) return 'pending';
    return 'ok';
  };
  
  const generalStatus = getGeneralStatus();
  
  const statusConfig = {
    empty: {
      bgColor: 'bg-muted',
      textColor: 'text-muted-foreground',
      icon: Trophy,
      label: 'Nenhuma inscrição',
      description: 'Inscreva-se nas modalidades abaixo'
    },
    ok: {
      bgColor: 'bg-success/10',
      textColor: 'text-success',
      icon: CheckCircle2,
      label: 'Tudo certo!',
      description: 'Suas inscrições estão confirmadas'
    },
    pending: {
      bgColor: 'bg-warning/10',
      textColor: 'text-warning',
      icon: Clock,
      label: 'Aguardando confirmação',
      description: 'Algumas inscrições estão pendentes'
    },
    attention: {
      bgColor: 'bg-destructive/10',
      textColor: 'text-destructive',
      icon: AlertCircle,
      label: 'Ação necessária',
      description: 'Há pagamento pendente'
    }
  };
  
  const config = statusConfig[generalStatus];
  const StatusIcon = config.icon;

  return (
    <Card className={`border-2 ${generalStatus === 'ok' ? 'border-success/30' : generalStatus === 'attention' ? 'border-destructive/30' : 'border-border'}`}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Status Overview */}
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${config.bgColor}`}>
              <StatusIcon className={`h-6 w-6 ${config.textColor}`} />
            </div>
            <div>
              <h3 className={`font-semibold ${config.textColor}`}>
                {config.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                {config.description}
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="text-sm py-1.5 px-3">
              <Trophy className="h-4 w-4 mr-1.5" />
              {totalEnrolled} {totalEnrolled === 1 ? 'modalidade' : 'modalidades'}
            </Badge>
            
            {confirmedCount > 0 && (
              <Badge variant="default" className="text-sm py-1.5 px-3 bg-success hover:bg-success/90">
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                {confirmedCount} {confirmedCount === 1 ? 'confirmada' : 'confirmadas'}
              </Badge>
            )}
            
            {pendingCount > 0 && (
              <Badge variant="secondary" className="text-sm py-1.5 px-3">
                <Clock className="h-4 w-4 mr-1.5" />
                {pendingCount} {pendingCount === 1 ? 'pendente' : 'pendentes'}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Payment Status */}
        {totalEnrolled > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className={`h-4 w-4 ${isPaid ? 'text-success' : 'text-warning'}`} />
                <span className="text-sm font-medium">
                  Situação do pagamento:
                </span>
              </div>
              <Badge 
                variant={isPaid ? 'default' : 'secondary'}
                className={isPaid ? 'bg-success hover:bg-success/90' : ''}
              >
                {paymentStatus === 'isento' ? 'Isento' : 
                 paymentStatus === 'pago' ? 'Pago' : 
                 paymentStatus === 'pendente' ? 'Pendente' : 
                 paymentStatus || 'Pendente'}
              </Badge>
            </div>
            {hasPendingPayment && paymentAmount && paymentAmount > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Valor pendente: R$ {paymentAmount.toFixed(2).replace('.', ',')}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
