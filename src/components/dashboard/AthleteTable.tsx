import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AthleteManagement } from '@/lib/api';
import { AthleteRegistrationCard } from '@/components/AthleteRegistrationCard';
import { getStatusBadgeStyle } from '@/components/athlete-card/utils/statusColors';
import { EnrollmentType } from '@/hooks/useEnrollAthleteInModality';

interface AthleteTableProps {
  athletes: AthleteManagement[];
  onStatusChange: (modalityId: string, status: string, justification: string) => Promise<void>;
  onPaymentStatusChange?: (athleteId: string, status: string) => Promise<void>;
  currentUserId?: string;
  eventId?: string;
  enrollmentType?: EnrollmentType;
  readOnly?: boolean;
}

export function AthleteTable({
  athletes,
  onStatusChange,
  onPaymentStatusChange,
  currentUserId,
  eventId,
  enrollmentType,
  readOnly,
}: AthleteTableProps) {
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);

  if (athletes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum atleta encontrado com os filtros selecionados.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold">Nome</TableHead>
              <TableHead className="font-semibold">Pagamento</TableHead>
              <TableHead className="font-semibold">Modalidades</TableHead>
              <TableHead className="font-semibold">Filial</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {athletes.map((athlete) => {
              const isCurrentUser = athlete.id === currentUserId;
              return (
                <TableRow
                  key={athlete.id}
                  className={cn(
                    'cursor-pointer transition-colors hover:bg-muted/40',
                    isCurrentUser && 'bg-olimpics-green-primary/5',
                  )}
                  onClick={() => setSelectedAthleteId(athlete.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{athlete.nome_atleta}</span>
                      {isCurrentUser && (
                        <Badge className="text-[10px] px-1.5 py-0 bg-olimpics-green-primary/10 text-olimpics-green-primary border-olimpics-green-primary/20">
                          Eu
                        </Badge>
                      )}
                      {athlete.numero_identificador && (
                        <span className="text-xs text-muted-foreground">#{athlete.numero_identificador}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('capitalize text-xs', getStatusBadgeStyle(athlete.status_pagamento))}>
                      {athlete.status_pagamento}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {athlete.modalidades.slice(0, 3).map((mod) => (
                        <Badge
                          key={mod.id}
                          variant="outline"
                          className={cn('text-[10px] px-1.5 py-0', getStatusBadgeStyle(mod.status))}
                        >
                          {mod.modalidade}
                        </Badge>
                      ))}
                      {athlete.modalidades.length > 3 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          +{athlete.modalidades.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {athlete.filial_nome}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de detalhe — reutiliza AthleteRegistrationCard com controle externo */}
      {selectedAthleteId && (() => {
        const athlete = athletes.find(a => a.id === selectedAthleteId)!;
        return (
          <AthleteRegistrationCard
            key={athlete.id}
            registration={athlete}
            onStatusChange={onStatusChange}
            onPaymentStatusChange={onPaymentStatusChange}
            isCurrentUser={athlete.id === currentUserId}
            readOnly={readOnly}
            eventId={eventId}
            enrollmentType={enrollmentType}
            dialogOpen={true}
            onDialogOpenChange={(open) => { if (!open) setSelectedAthleteId(null); }}
          />
        );
      })()}
    </>
  );
}
