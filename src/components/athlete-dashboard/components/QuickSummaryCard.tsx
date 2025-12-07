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

export function QuickSummaryCard({ totalEnrolled, pendingPayment, paymentStatus }: QuickSummaryCardProps) {
  const getPaymentStatusDisplay = () => {
    if (!paymentStatus) {
      return {
        label: 'Não inscrito',
        variant: 'secondary' as const,
        className: 'bg-muted text-muted-foreground'
      };
    }

    switch (paymentStatus.status_pagamento) {
      case 'confirmado':
        return {
          label: 'Confirmado',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        };
      case 'pendente':
        return {
          label: 'Pendente',
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
        };
      case 'cancelado':
        return {
          label: 'Cancelado',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        };
      case 'isento':
        return {
          label: 'Isento',
          variant: 'default' as const,
          className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        };
      default:
        return {
          label: paymentStatus.status_pagamento || 'Pendente',
          variant: 'secondary' as const,
          className: 'bg-muted text-muted-foreground'
        };
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'Gratuito';
    if (value === 0) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const paymentDisplay = getPaymentStatusDisplay();
  const isExempt = paymentStatus?.isento;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Modalidades Inscritas */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold text-foreground">{totalEnrolled}</p>
              <p className="text-xs text-muted-foreground truncate">Modalidades</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pendentes */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10 shrink-0">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold text-foreground">{pendingPayment}</p>
              <p className="text-xs text-muted-foreground truncate">Pendentes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Pagamento */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10 shrink-0">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <Badge className={`text-xs font-medium ${paymentDisplay.className}`}>
                {paymentDisplay.label}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1 truncate">Pagamento</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Taxa do Evento */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 shrink-0">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-foreground truncate">
                {isExempt ? 'Isento' : formatCurrency(paymentStatus?.valor_taxa)}
              </p>
              <p className="text-xs text-muted-foreground truncate">Taxa do Evento</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
