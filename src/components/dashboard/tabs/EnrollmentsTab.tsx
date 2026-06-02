
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  CheckCircle, XCircle, Loader2, Clock, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ModalityEnrollments } from '../ModalityEnrollments';
import { EnrolledUser } from '../types/enrollmentTypes';
import { usePendingEnrollments, PendingEnrollment } from '@/hooks/usePendingEnrollments';
import { updateModalityStatus } from '@/lib/api/modalities';

interface EnrollmentsTabProps {
  enrollments: EnrolledUser[];
  eventId: string;
  filialIds?: string[];
}

interface AthleteGroup {
  atleta_id: string;
  nome_atleta: string;
  filial: string;
  status_pagamento: 'pendente' | 'confirmado' | 'cancelado';
  modalities: PendingEnrollment[];
}

function groupByAthlete(enrollments: PendingEnrollment[]): AthleteGroup[] {
  const map = new Map<string, AthleteGroup>();
  for (const e of enrollments) {
    if (!map.has(e.atleta_id)) {
      map.set(e.atleta_id, {
        atleta_id: e.atleta_id,
        nome_atleta: e.nome_atleta,
        filial: e.filial,
        status_pagamento: e.status_pagamento,
        modalities: [],
      });
    }
    map.get(e.atleta_id)!.modalities.push(e);
  }
  return Array.from(map.values()).sort((a, b) =>
    a.nome_atleta.localeCompare(b.nome_atleta, 'pt-BR', { sensitivity: 'base' })
  );
}

const PAGE_SIZE = 10;

export function EnrollmentsTab({ enrollments, eventId, filialIds }: EnrollmentsTabProps) {
  const queryClient = useQueryClient();
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const [expandedAthletes, setExpandedAthletes] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  // pending unpaid confirmation dialog
  const [confirmAction, setConfirmAction] = useState<{
    ids: number[];
    athleteName: string;
    action: 'aprovado' | 'rejeitado';
  } | null>(null);

  const { data: pendingEnrollments = [], isLoading: loadingPending } =
    usePendingEnrollments(eventId, filialIds);

  const athleteGroups = groupByAthlete(pendingEnrollments);

  // Abre todos os cards por padrão quando os dados chegam
  useEffect(() => {
    if (athleteGroups.length > 0) {
      setExpandedAthletes(new Set(athleteGroups.map(g => g.atleta_id)));
    }
  }, [pendingEnrollments.length]);

  // Reset page quando os dados mudam
  useEffect(() => { setPage(1); }, [pendingEnrollments.length]);

  const totalPages = Math.ceil(athleteGroups.length / PAGE_SIZE);
  const pagedGroups = athleteGroups.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['pending-enrollments'] });
    queryClient.invalidateQueries({ queryKey: ['confirmed-enrollments'] });
    queryClient.invalidateQueries({ queryKey: ['athlete-management'] });
    queryClient.invalidateQueries({ queryKey: ['branch-analytics'] });
  };

  const applyStatus = async (ids: number[], status: 'confirmado' | 'rejeitado') => {
    setLoadingIds(prev => new Set([...prev, ...ids]));
    try {
      await Promise.all(ids.map(id => updateModalityStatus(String(id), status, '')));
      toast.success(
        status === 'confirmado'
          ? `${ids.length} modalidade(s) aprovada(s)!`
          : `${ids.length} modalidade(s) reprovada(s).`
      );
      invalidate();
    } catch {
      toast.error('Erro ao atualizar status das inscrições.');
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        ids.forEach(id => next.delete(id));
        return next;
      });
    }
  };

  const requestAction = (
    group: AthleteGroup,
    ids: number[],
    action: 'aprovado' | 'rejeitado'
  ) => {
    if (action === 'aprovado' && group.status_pagamento !== 'confirmado') {
      setConfirmAction({ ids, athleteName: group.nome_atleta, action });
    } else {
      applyStatus(ids, action);
    }
  };

  const toggleExpand = (athleteId: string) => {
    setExpandedAthletes(prev => {
      const next = new Set(prev);
      if (next.has(athleteId)) next.delete(athleteId);
      else next.add(athleteId);
      return next;
    });
  };

  const isGroupLoading = (group: AthleteGroup) =>
    group.modalities.some(m => loadingIds.has(m.id));

  return (
    <TooltipProvider>
      <div className="mt-4">
        <h2 className="text-2xl font-bold mb-4 text-olimpics-text">Inscrições por Modalidade</h2>

        <Tabs defaultValue="pendentes">
          <TabsList className="mb-4">
            <TabsTrigger value="pendentes" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pendentes
              {pendingEnrollments.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                  {pendingEnrollments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="confirmadas" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Confirmadas
              {enrollments.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {enrollments.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pendentes">
            {loadingPending ? (
              <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
                <Loader2 className="h-5 w-5 animate-spin" /> Carregando pendências...
              </div>
            ) : athleteGroups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma inscrição pendente.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-sm text-muted-foreground">
                    {athleteGroups.length} atleta(s) com {pendingEnrollments.length} inscrição(ões) pendente(s)
                  </p>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Button
                        variant="outline" size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                      >Anterior</Button>
                      <span className="text-muted-foreground">Página {page} de {totalPages}</span>
                      <Button
                        variant="outline" size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                      >Próxima</Button>
                    </div>
                  )}
                </div>

                {pagedGroups.map(group => {
                  const expanded = expandedAthletes.has(group.atleta_id);
                  const ids = group.modalities.map(m => m.id);
                  const unpaid = group.status_pagamento !== 'confirmado';
                  const loading = isGroupLoading(group);

                  return (
                    <div
                      key={group.atleta_id}
                      className={`border rounded-lg overflow-hidden ${unpaid ? 'border-amber-300' : ''}`}
                    >
                      {/* Athlete header row */}
                      <div
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer select-none ${
                          unpaid ? 'bg-amber-50' : 'bg-muted/30'
                        }`}
                        onClick={() => toggleExpand(group.atleta_id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{group.nome_atleta}</span>
                            <span className="text-xs text-muted-foreground">{group.filial}</span>
                            <Badge variant="outline" className="text-xs">
                              {group.modalities.length} modalidade(s)
                            </Badge>
                            {unpaid && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                    <AlertTriangle className="h-3 w-3" />
                                    Pagamento pendente
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Este atleta ainda não confirmou o pagamento da inscrição no evento.
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>

                        {/* Actions on header */}
                        <div
                          className="flex items-center gap-2 shrink-0"
                          onClick={e => e.stopPropagation()}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700 h-8"
                            disabled={loading}
                            onClick={() => requestAction(group, ids, 'aprovado')}
                          >
                            {loading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            <span className="ml-1 hidden sm:inline text-xs">
                              Aprovar todas ({group.modalities.length})
                            </span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 h-8"
                            disabled={loading}
                            onClick={() => requestAction(group, ids, 'rejeitado')}
                          >
                            {loading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            <span className="ml-1 hidden sm:inline text-xs">
                              Reprovar todas
                            </span>
                          </Button>
                          <button className="text-muted-foreground p-1">
                            {expanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Modalities list (expandable) */}
                      {expanded && (
                        <div className="divide-y border-t">
                          {group.modalities.map(m => (
                            <div
                              key={m.id}
                              className="flex items-center gap-3 px-6 py-2.5 bg-background"
                            >
                              <span className="flex-1 text-sm">{m.modalidade_nome}</span>
                              <span className="text-xs text-muted-foreground hidden md:block">
                                {m.data_inscricao
                                  ? new Date(m.data_inscricao).toLocaleDateString('pt-BR')
                                  : '-'}
                              </span>
                              <div
                                className="flex items-center gap-2"
                                onClick={e => e.stopPropagation()}
                              >
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-green-600 hover:bg-green-50 hover:text-green-700 h-7 px-2"
                                  disabled={loadingIds.has(m.id)}
                                  onClick={() => requestAction(group, [m.id], 'aprovado')}
                                >
                                  {loadingIds.has(m.id) ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-3.5 w-3.5" />
                                  )}
                                  <span className="ml-1 text-xs">Aprovar</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:bg-red-50 hover:text-red-700 h-7 px-2"
                                  disabled={loadingIds.has(m.id)}
                                  onClick={() => requestAction(group, [m.id], 'rejeitado')}
                                >
                                  {loadingIds.has(m.id) ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <XCircle className="h-3.5 w-3.5" />
                                  )}
                                  <span className="ml-1 text-xs">Reprovar</span>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
                    <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Próxima</Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="confirmadas">
            {enrollments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma inscrição confirmada encontrada.
              </div>
            ) : (
              <ModalityEnrollments enrollments={enrollments} />
            )}
          </TabsContent>
        </Tabs>

        {/* Confirmation dialog for unpaid athletes */}
        <AlertDialog
          open={!!confirmAction}
          onOpenChange={open => { if (!open) setConfirmAction(null); }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Atleta sem pagamento confirmado
              </AlertDialogTitle>
              <AlertDialogDescription>
                O atleta <strong>{confirmAction?.athleteName}</strong> ainda não confirmou o
                pagamento da inscrição no evento. Deseja aprovar a(s) modalidade(s) mesmo assim?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (confirmAction) {
                    applyStatus(confirmAction.ids, 'confirmado');
                    setConfirmAction(null);
                  }
                }}
              >
                Aprovar mesmo assim
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
