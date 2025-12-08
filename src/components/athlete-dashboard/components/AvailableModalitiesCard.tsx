import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy, Search, AlertCircle, Loader2, Clock, MapPin } from 'lucide-react';
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

  const filteredAndSortedModalities = modalities
    .filter(m => 
      m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.categoria && m.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const schedulesA = getSchedulesForMod(a.id);
      const schedulesB = getSchedulesForMod(b.id);
      
      // Get first day order (put modalities without schedule at the end)
      const firstScheduleA = schedulesA[0];
      const firstScheduleB = schedulesB[0];
      
      const dayA = firstScheduleA?.dia_semana ? (dayOrder[firstScheduleA.dia_semana] ?? 99) : 99;
      const dayB = firstScheduleB?.dia_semana ? (dayOrder[firstScheduleB.dia_semana] ?? 99) : 99;
      
      if (dayA !== dayB) return dayA - dayB;
      
      // If same day, sort by time
      const timeA = firstScheduleA?.horario_inicio || '99:99';
      const timeB = firstScheduleB?.horario_inicio || '99:99';
      
      return timeA.localeCompare(timeB);
    });


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
        ) : filteredAndSortedModalities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Search className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma encontrada para "{searchTerm}".</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Group modalities by first day of week */}
            {Object.entries(
              filteredAndSortedModalities.reduce((groups, modality) => {
                const schedules = getSchedulesForMod(modality.id);
                const day = schedules[0]?.dia_semana || 'Sem dia definido';
                if (!groups[day]) groups[day] = [];
                groups[day].push(modality);
                return groups;
              }, {} as Record<string, typeof filteredAndSortedModalities>)
            ).map(([dayName, dayModalities]) => (
              <div key={dayName}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {dayName}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dayModalities.map((modality) => {
                    const vacancyAvailable = isVacancyAvailable(modality);
                    const isRegistering = registeringId === modality.id;
                    const schedules = getSchedulesForMod(modality.id);

                    return (
                      <div
                        key={modality.id}
                        className="flex flex-col p-3 rounded-lg bg-muted/30 border border-border/50"
                      >
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-foreground text-sm">{modality.nome}</h4>
                            <Badge variant="outline" className="shrink-0 text-xs">
                              {modality.tipo_modalidade}
                            </Badge>
                          </div>
                          
                          {modality.categoria && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {modality.categoria}
                            </p>
                          )}
                          
                          {/* Display all schedules */}
                          {schedules.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {schedules.map((schedule, idx) => (
                                <div key={idx} className="flex flex-col gap-0.5">
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3 shrink-0" />
                                    <span>
                                      <span className="font-medium">{schedule.dia_semana}</span>
                                      {schedule.horario_inicio && (
                                        <> • {formatScheduleTime(schedule.horario_inicio, schedule.horario_fim)}</>
                                      )}
                                    </span>
                                  </div>
                                  {schedule.local && (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-[18px]">
                                      <MapPin className="h-3 w-3 shrink-0" />
                                      <span>{schedule.local}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

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
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
