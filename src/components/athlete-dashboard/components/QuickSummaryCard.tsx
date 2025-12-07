import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, CreditCard, CheckCircle2 } from 'lucide-react';
import { AthletePaymentStatus } from '../hooks/useAthletePaymentStatus';

interface QuickSummaryCardProps {
  totalEnrolled: number;
  pendingPayment: number;
  paymentStatus: AthletePaymentStatus | null | undefined;
}

export function QuickSummaryCard({ 
  totalEnrolled, 
  pendingPayment, 
  paymentStatus 
}: QuickSummaryCardProps) {
  const getPaymentStatusDisplay = () => {
    if (!paymentStatus) return null;
    
    switch (paymentStatus.status_pagamento) {
      case 'confirmado':
        return {
          label: 'Confirmado',
          variant: 'default' as const,
          className: 'bg-green-500/90'
        };
      case 'pendente':
        return {
          label: 'Pendente',
          variant: 'secondary' as const,
          className: 'bg-yellow-500/90 text-white'
        };
      case 'cancelado':
        return {
          label: 'Cancelado',
          variant: 'destructive' as const,
          className: ''
        };
      default:
        return {
          label: paymentStatus.status_pagamento || 'Não informado',
          variant: 'outline' as const,
          className: ''
        };
    }
  };

  const paymentDisplay = getPaymentStatusDisplay();

  const formatCurrency = (value: number | null) => {
    if (value === null) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Total Enrolled */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalEnrolled}</p>
              <p className="text-xs text-muted-foreground">Modalidades Inscritas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Modalities */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingPayment}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Status */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div>
              {paymentDisplay ? (
                <>
                  <Badge variant={paymentDisplay.variant} className={paymentDisplay.className}>
                    {paymentDisplay.label}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Pagamento</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-muted-foreground">-</p>
                  <p className="text-xs text-muted-foreground">Pagamento</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Value */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(paymentStatus?.valor_taxa ?? null)}
              </p>
              <p className="text-xs text-muted-foreground">Taxa do Evento</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
