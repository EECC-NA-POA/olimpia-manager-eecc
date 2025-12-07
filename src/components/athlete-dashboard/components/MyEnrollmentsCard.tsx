import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardList, AlertCircle, Phone, User, ChevronDown, ChevronUp, MessageCircle, Clock } from 'lucide-react';
import { RegisteredModality } from '@/types/modality';
import { useModalityMutations } from '@/hooks/useModalityMutations';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ModalitySchedule, formatScheduleTime } from '../hooks/useModalitySchedules';

interface Representative {
  nome_completo: string;
  telefone?: string;
}

interface MyEnrollmentsCardProps {
  enrollments: RegisteredModality[];
  userId: string;
  eventId: string;
  modalitiesWithRepresentatives?: Array<{
    id: number;
    representatives: Representative[];
  }>;
  modalitySchedules?: ModalitySchedule[];
}

const formatPhoneForWhatsApp = (phone: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 11 && !cleanPhone.startsWith('55')) {
    return `55${cleanPhone}`;
  }
  if (cleanPhone.length === 10 && !cleanPhone.startsWith('55')) {
    return `55${cleanPhone}`;
  }
  return cleanPhone;
};

export function MyEnrollmentsCard({ 
  enrollments, 
  userId, 
  eventId,
  modalitiesWithRepresentatives = [],
  modalitySchedules = []
}: MyEnrollmentsCardProps) {
  const { withdrawMutation } = useModalityMutations(userId, eventId);
  const [expandedModalities, setExpandedModalities] = useState<Set<number>>(new Set());

  const toggleModality = (id: number) => {
    setExpandedModalities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getRepresentativesForModality = (modalityId: number): Representative[] => {
    const modality = modalitiesWithRepresentatives.find(m => m.id === modalityId);
    return modality?.representatives || [];
  };
  
  const getScheduleForModality = (modalityId: number): ModalitySchedule | undefined => {
    return modalitySchedules.find(s => s.modalidade_id === modalityId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmada':
      case 'confirmado':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">Confirmada</Badge>;
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs">Pendente</Badge>;
      case 'rejeitada':
      case 'rejeitado':
        return <Badge variant="destructive" className="text-xs">Rejeitada</Badge>;
      case 'cancelada':
      case 'cancelado':
        return <Badge variant="outline" className="text-muted-foreground text-xs">Cancelada</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
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
            {enrollments.map((enrollment) => {
              const representatives = getRepresentativesForModality(enrollment.modalidade.id);
              const hasRepresentatives = representatives.length > 0;
              const isExpanded = expandedModalities.has(enrollment.id);
              const schedule = getScheduleForModality(enrollment.modalidade.id);

              return (
                <Collapsible 
                  key={enrollment.id} 
                  open={isExpanded} 
                  onOpenChange={() => toggleModality(enrollment.id)}
                >
                  <div className="rounded-lg bg-muted/30 border border-border/50 overflow-hidden">
                    {/* Main Content */}
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-foreground text-sm sm:text-base">
                          {enrollment.modalidade.nome}
                        </h4>
                        {getStatusBadge(enrollment.status)}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-1">
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
                      
                      {schedule && (schedule.dia_semana || schedule.horario_inicio) && (
                        <div className="flex items-center gap-1.5 text-xs text-primary mt-2">
                          <Clock className="h-3 w-3" />
                          <span>
                            {schedule.dia_semana && <span className="font-medium">{schedule.dia_semana}</span>}
                            {schedule.dia_semana && schedule.horario_inicio && ' • '}
                            {schedule.horario_inicio && formatScheduleTime(schedule.horario_inicio, schedule.horario_fim)}
                          </span>
                        </div>
                      )}

                      {/* Action Row */}
                      <div className="flex items-center gap-2 mt-2">
                        {hasRepresentatives && (
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 gap-1.5"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Representantes</span>
                              <span className="sm:hidden">Contato</span>
                              {isExpanded ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        )}

                        {canWithdraw(enrollment.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                            onClick={() => withdrawMutation.mutate(enrollment.id)}
                            disabled={withdrawMutation.isPending}
                          >
                            Desistir
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Representatives Section */}
                    <CollapsibleContent>
                      {hasRepresentatives && (
                        <div className="px-3 pb-3 pt-1 border-t border-border/30 bg-muted/20">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                            <User className="h-3.5 w-3.5" />
                            <span>Representantes da Modalidade</span>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {representatives.map((rep, index) => (
                              <div 
                                key={index}
                                className="flex items-center gap-2.5 p-2.5 rounded-md bg-background border border-border/50"
                              >
                                <div className="p-1.5 rounded-full bg-green-500/10 shrink-0">
                                  <User className="h-3.5 w-3.5 text-green-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-foreground text-xs truncate">
                                    {rep.nome_completo}
                                  </p>
                                  {rep.telefone && (
                                    <a
                                      href={`https://wa.me/${formatPhoneForWhatsApp(rep.telefone)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 text-xs mt-0.5 transition-colors"
                                    >
                                      <Phone className="h-3 w-3" />
                                      <span>{rep.telefone}</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
