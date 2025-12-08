import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy, Search, AlertCircle, Loader2, Clock, MapPin, CalendarDays } from 'lucide-react';
import { AvailableModality } from '../hooks/useAvailableModalitiesForAthlete';
import { useModalityMutations } from '@/hooks/useModalityMutations';
import { ModalityScheduleItem, getSchedulesForModality, formatScheduleTime } from '../hooks/useModalitySchedules';

interface AvailableModalitiesCardProps {
  modalities: AvailableModality[];
  userId: string;
  eventId: string;
  registeredModalityIds: number[];
  modalitySchedules?: ModalityScheduleItem[];
}

export function AvailableModalitiesCard({ 
  modalities, 
  userId, 
  eventId,
  registeredModalityIds,
  modalitySchedules = []
}: AvailableModalitiesCardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { registerMutation } = useModalityMutations(userId, eventId);
  const [registeringId, setRegisteringId] = useState<number | null>(null);
  
  const getSchedulesForMod = (modalityId: number): ModalityScheduleItem[] => {
    return getSchedulesForModality(modalityId, modalitySchedules);
  };

  // Day of week order for sorting (Monday = 0, Sunday = 6)
  const dayOrder: Record<string, number> = {
    'Segunda-feira': 0,
    'Terça-feira': 1,
    'Quarta-feira': 2,
    'Quinta-feira': 3,
    'Sexta-feira': 4,
    'Sábado': 5,
    'Domingo': 6
  };

  // Filter modalities by search term
  const filteredModalities = modalities.filter(m => 
    m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.categoria && m.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort modalities alphabetically by name
  const sortedModalities = [...filteredModalities].sort((a, b) => 
    a.nome.localeCompare(b.nome, 'pt-BR')
  );

  // Get sorted schedules for a modality (by day order, then by time)
  const getSortedSchedules = (modalityId: number): ModalityScheduleItem[] => {
    const schedules = getSchedulesForMod(modalityId);
    return schedules.sort((a, b) => {
      const dayA = dayOrder[a.dia_semana] ?? 99;
      const dayB = dayOrder[b.dia_semana] ?? 99;
      if (dayA !== dayB) return dayA - dayB;
      const timeA = a.horario_inicio || '99:99';
      const timeB = b.horario_inicio || '99:99';
      return timeA.localeCompare(timeB);
    });
  };

  const handleRegister = async (modalityId: number) => {
    setRegisteringId(modalityId);
    try {
      await registerMutation.mutateAsync(modalityId);
    } finally {
      setRegisteringId(null);
    }
  };

  const isVacancyAvailable = (modality: AvailableModality) => {
    if (!modality.limite_vagas) return true;
    return modality.vagas_ocupadas < modality.limite_vagas;
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <div className="flex flex-col gap-3">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary shrink-0" />
            <span className="truncate">Modalidades Disponíveis</span>
            {modalities.length > 0 && (
              <Badge variant="secondary" className="ml-auto shrink-0">{modalities.length}</Badge>
            )}
          </CardTitle>
          
          {modalities.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar modalidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-4">
        {modalities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Não há modalidades disponíveis.</p>
            <p className="text-xs text-muted-foreground mt-1">Você já está inscrito em todas ou não há modalidades cadastradas.</p>
          </div>
        ) : filteredModalities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Search className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma encontrada para "{searchTerm}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedModalities.map((modality) => {
              const schedules = getSortedSchedules(modality.id);
              const vacancyAvailable = isVacancyAvailable(modality);
              const isRegistering = registeringId === modality.id;

              return (
                <div
                  key={modality.id}
                  className="flex flex-col p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex-1">
                    {/* Header: Name and Type */}
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-foreground text-sm">{modality.nome}</h4>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {modality.tipo_modalidade}
                      </Badge>
                    </div>
                    
                    {/* Category */}
                    {modality.categoria && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {modality.categoria}
                      </p>
                    )}
                    
                    {/* Schedules Section */}
                    {schedules.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-border/30">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          <span>Horários:</span>
                        </div>
                        <div className="space-y-1.5">
                          {schedules.map((schedule, idx) => (
                            <div key={idx} className="text-xs text-muted-foreground pl-1">
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3 shrink-0" />
                                <span className="font-medium">{schedule.dia_semana}:</span>
                                <span>
                                  {schedule.horario_inicio && formatScheduleTime(schedule.horario_inicio, schedule.horario_fim)}
                                </span>
                              </div>
                              {schedule.local && (
                                <div className="flex items-center gap-1.5 mt-0.5 ml-4">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  <span>{schedule.local}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Single Enrollment Button */}
                  <Button
                    size="sm"
                    className="w-full mt-3 h-8 text-xs"
                    onClick={() => handleRegister(modality.id)}
                    disabled={!vacancyAvailable || isRegistering || registerMutation.isPending}
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Inscrevendo...
                      </>
                    ) : !vacancyAvailable ? (
                      'Sem Vagas'
                    ) : (
                      'Inscrever-se'
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
