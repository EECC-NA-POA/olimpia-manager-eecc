import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { AthleteManagement } from '@/types/api';
import { EnrollmentType } from '@/hooks/useEnrollAthleteInModality';
import { useBulkEnrollAthletes } from '@/hooks/useBulkEnrollAthletes';
import { useBulkUnenrollAthletes } from '@/hooks/useBulkUnenrollAthletes';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, UserPlus, UserMinus } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface BulkEnrollTabProps {
  eventId: string;
  athletes: AthleteManagement[];
  enrollmentType: EnrollmentType;
}

function paymentLabel(status: string) {
  if (status === 'confirmado') return 'Pgto confirmado';
  if (status === 'cancelado') return 'Pgto cancelado';
  return 'Pgto pendente';
}

function paymentVariant(status: string): 'default' | 'outline' | 'destructive' | 'secondary' {
  if (status === 'confirmado') return 'default';
  if (status === 'cancelado') return 'destructive';
  return 'secondary';
}

export function BulkEnrollTab({ eventId, athletes, enrollmentType }: BulkEnrollTabProps) {
  const { user } = useAuth();
  const [selectedModalityId, setSelectedModalityId] = useState<number | null>(null);
  const [enrollSelected, setEnrollSelected] = useState<Set<string>>(new Set());
  const [unenrollSelected, setUnenrollSelected] = useState<Set<string>>(new Set());
  const [enrollFilter, setEnrollFilter] = useState('');
  const [unenrollFilter, setUnenrollFilter] = useState('');

  const bulkEnroll = useBulkEnrollAthletes();
  const bulkUnenroll = useBulkUnenrollAthletes();

  const { data: modalities, isLoading: loadingModalities } = useQuery({
    queryKey: ['event-modalities', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, categoria, tipo_modalidade, limite_vagas, vagas_ocupadas')
        .eq('evento_id', eventId)
        .order('nome');
      if (error) throw error;
      return data as {
        id: number;
        nome: string;
        categoria: string | null;
        tipo_modalidade: string;
        limite_vagas: number | null;
        vagas_ocupadas: number;
      }[];
    },
    enabled: !!eventId,
  });

  const { data: enrolledIds, isLoading: loadingEnrolled } = useQuery({
    queryKey: ['enrolled-in-modality', selectedModalityId, eventId],
    queryFn: async () => {
      if (!selectedModalityId) return [];
      const { data, error } = await supabase
        .from('inscricoes_modalidades')
        .select('atleta_id')
        .eq('modalidade_id', selectedModalityId)
        .eq('evento_id', eventId);
      if (error) throw error;
      return (data || []).map((r: any) => r.atleta_id as string);
    },
    enabled: !!selectedModalityId && !!eventId,
  });

  const availableAthletes = athletes.filter(a => {
    const notEnrolled = !enrolledIds?.includes(a.id);
    const matches = !enrollFilter || a.nome_atleta?.toLowerCase().includes(enrollFilter.toLowerCase());
    return notEnrolled && matches;
  });

  const enrolledAthletes = athletes.filter(a => {
    const isEnrolled = enrolledIds?.includes(a.id);
    const matches = !unenrollFilter || a.nome_atleta?.toLowerCase().includes(unenrollFilter.toLowerCase());
    return isEnrolled && matches;
  });

  // — Enroll helpers —
  const allEnrollSelected = availableAthletes.length > 0 &&
    availableAthletes.every(a => enrollSelected.has(a.id));

  const toggleAllEnroll = () => {
    setEnrollSelected(allEnrollSelected
      ? new Set()
      : new Set(availableAthletes.map(a => a.id)));
  };

  const toggleEnroll = (id: string) => {
    setEnrollSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleEnroll = () => {
    if (!selectedModalityId || enrollSelected.size === 0 || !user) return;
    bulkEnroll.mutate(
      { athleteIds: Array.from(enrollSelected), modalityId: selectedModalityId, eventId, enrolledBy: user.id, enrollmentType },
      { onSuccess: () => setEnrollSelected(new Set()) }
    );
  };

  // — Unenroll helpers —
  const allUnenrollSelected = enrolledAthletes.length > 0 &&
    enrolledAthletes.every(a => unenrollSelected.has(a.id));

  const toggleAllUnenroll = () => {
    setUnenrollSelected(allUnenrollSelected
      ? new Set()
      : new Set(enrolledAthletes.map(a => a.id)));
  };

  const toggleUnenroll = (id: string) => {
    setUnenrollSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleUnenroll = () => {
    if (!selectedModalityId || unenrollSelected.size === 0) return;
    bulkUnenroll.mutate(
      { athleteIds: Array.from(unenrollSelected), modalityId: selectedModalityId, eventId },
      { onSuccess: () => setUnenrollSelected(new Set()) }
    );
  };

  const onModalityChange = (val: string) => {
    setSelectedModalityId(Number(val));
    setEnrollSelected(new Set());
    setUnenrollSelected(new Set());
  };

  return (
    <div className="mt-4 space-y-6">
      <h2 className="text-2xl font-bold text-olimpics-text">Inscrição em Lote</h2>

      {/* Modality selector */}
      <div className="space-y-2 max-w-md">
        <label className="text-sm font-medium">Selecione a modalidade</label>
        {loadingModalities ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando modalidades...
          </div>
        ) : (
          <Select
            value={selectedModalityId ? String(selectedModalityId) : ''}
            onValueChange={onModalityChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Escolha uma modalidade..." />
            </SelectTrigger>
            <SelectContent>
              {modalities?.map(m => (
                <SelectItem key={m.id} value={String(m.id)}>
                  {m.nome}
                  {m.limite_vagas != null && m.limite_vagas > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({m.vagas_ocupadas}/{m.limite_vagas} vagas)
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedModalityId && (
        loadingEnrolled ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando atletas...
          </div>
        ) : (
          <Tabs defaultValue="inscrever">
            <TabsList>
              <TabsTrigger value="inscrever" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Inscrever
                {availableAthletes.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {availableAthletes.length} disponíveis
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="desinscrever" className="flex items-center gap-2">
                <UserMinus className="h-4 w-4" />
                Desinscrever
                {enrolledAthletes.length > 0 && (
                  <Badge variant="outline" className="ml-1 h-5 px-1.5 text-xs">
                    {enrolledAthletes.length} inscritos
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ── INSCREVER ── */}
            <TabsContent value="inscrever" className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {enrollSelected.size > 0 && (
                    <Badge variant="secondary">{enrollSelected.size} selecionado(s)</Badge>
                  )}
                </div>
                <Button
                  onClick={handleEnroll}
                  disabled={enrollSelected.size === 0 || bulkEnroll.isPending}
                  size="sm"
                >
                  {bulkEnroll.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Inscrevendo...</>
                  ) : (
                    `Inscrever ${enrollSelected.size > 0 ? enrollSelected.size : ''} selecionado(s)`
                  )}
                </Button>
              </div>

              <Input
                placeholder="Filtrar por nome..."
                value={enrollFilter}
                onChange={e => setEnrollFilter(e.target.value)}
                className="max-w-xs"
              />

              {availableAthletes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {enrollFilter
                    ? 'Nenhum atleta encontrado com esse nome.'
                    : 'Todos os atletas já estão inscritos nesta modalidade.'}
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 border-b">
                    <Checkbox checked={allEnrollSelected} onCheckedChange={toggleAllEnroll} id="enroll-all" />
                    <label htmlFor="enroll-all" className="text-sm font-medium cursor-pointer select-none">
                      Selecionar todos ({availableAthletes.length})
                    </label>
                  </div>
                  <div className="overflow-y-auto" style={{ maxHeight: '420px' }}>
                    <div className="divide-y">
                      {availableAthletes.map(athlete => (
                        <div
                          key={athlete.id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 cursor-pointer"
                          onClick={() => toggleEnroll(athlete.id)}
                        >
                          <Checkbox
                            checked={enrollSelected.has(athlete.id)}
                            onCheckedChange={() => toggleEnroll(athlete.id)}
                            onClick={e => e.stopPropagation()}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{athlete.nome_atleta}</p>
                            <p className="text-xs text-muted-foreground">{athlete.filial_nome}</p>
                          </div>
                          <Badge variant={paymentVariant(athlete.status_pagamento)} className="text-xs shrink-0">
                            {paymentLabel(athlete.status_pagamento)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ── DESINSCREVER ── */}
            <TabsContent value="desinscrever" className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {unenrollSelected.size > 0 && (
                    <Badge variant="destructive">{unenrollSelected.size} selecionado(s)</Badge>
                  )}
                </div>
                <Button
                  onClick={handleUnenroll}
                  disabled={unenrollSelected.size === 0 || bulkUnenroll.isPending}
                  variant="destructive"
                  size="sm"
                >
                  {bulkUnenroll.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Desinscrevendo...</>
                  ) : (
                    `Desinscrever ${unenrollSelected.size > 0 ? unenrollSelected.size : ''} selecionado(s)`
                  )}
                </Button>
              </div>

              <Input
                placeholder="Filtrar por nome..."
                value={unenrollFilter}
                onChange={e => setUnenrollFilter(e.target.value)}
                className="max-w-xs"
              />

              {enrolledAthletes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {unenrollFilter
                    ? 'Nenhum atleta encontrado com esse nome.'
                    : 'Nenhum atleta inscrito nesta modalidade.'}
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 border-b">
                    <Checkbox checked={allUnenrollSelected} onCheckedChange={toggleAllUnenroll} id="unenroll-all" />
                    <label htmlFor="unenroll-all" className="text-sm font-medium cursor-pointer select-none">
                      Selecionar todos ({enrolledAthletes.length})
                    </label>
                  </div>
                  <div className="overflow-y-auto" style={{ maxHeight: '420px' }}>
                    <div className="divide-y">
                      {enrolledAthletes.map(athlete => (
                        <div
                          key={athlete.id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 cursor-pointer"
                          onClick={() => toggleUnenroll(athlete.id)}
                        >
                          <Checkbox
                            checked={unenrollSelected.has(athlete.id)}
                            onCheckedChange={() => toggleUnenroll(athlete.id)}
                            onClick={e => e.stopPropagation()}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{athlete.nome_atleta}</p>
                            <p className="text-xs text-muted-foreground">{athlete.filial_nome}</p>
                          </div>
                          <Badge variant={paymentVariant(athlete.status_pagamento)} className="text-xs shrink-0">
                            {paymentLabel(athlete.status_pagamento)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )
      )}
    </div>
  );
}
