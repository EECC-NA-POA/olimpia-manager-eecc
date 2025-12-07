import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardList, AlertCircle } from 'lucide-react';
import { RegisteredModality } from '@/types/modality';
import { useModalityMutations } from '@/hooks/useModalityMutations';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MyEnrollmentsCardProps {
  enrollments: RegisteredModality[];
  userId: string;
  eventId: string;
}

export function MyEnrollmentsCard({ enrollments, userId, eventId }: MyEnrollmentsCardProps) {
  const { withdrawMutation } = useModalityMutations(userId, eventId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmada':
      case 'confirmado':
        return <Badge variant="default" className="bg-green-500/90">Confirmada</Badge>;
      case 'pendente':
        return <Badge variant="secondary" className="bg-yellow-500/90 text-white">Pendente</Badge>;
      case 'rejeitada':
      case 'rejeitado':
        return <Badge variant="destructive">Rejeitada</Badge>;
      case 'cancelada':
      case 'cancelado':
        return <Badge variant="outline" className="text-muted-foreground">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return '-';
    }
  };

  const canWithdraw = (status: string) => {
    return status === 'pendente';
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary shrink-0" />
          <span className="truncate">Minhas Inscrições</span>
          {enrollments.length > 0 && (
            <Badge variant="secondary" className="ml-auto shrink-0">{enrollments.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-4">
        {enrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Você ainda não está inscrito em nenhuma modalidade.</p>
            <p className="text-xs text-muted-foreground mt-1">Confira as modalidades disponíveis abaixo.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex flex-col p-3 rounded-lg bg-muted/30 border border-border/50 gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-foreground text-sm sm:text-base">
                    {enrollment.modalidade.nome}
                  </h4>
                  {getStatusBadge(enrollment.status)}
                </div>
                
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  {enrollment.modalidade.categoria && (
                    <>
                      <span>{enrollment.modalidade.categoria}</span>
                      <span className="text-border">•</span>
                    </>
                  )}
                  <span>{enrollment.modalidade.tipo_modalidade}</span>
                  <span className="text-border">•</span>
                  <span>{formatDate(enrollment.data_inscricao)}</span>
                </div>

                {canWithdraw(enrollment.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto mt-1 text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => withdrawMutation.mutate(enrollment.id)}
                    disabled={withdrawMutation.isPending}
                  >
                    Desistir
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
