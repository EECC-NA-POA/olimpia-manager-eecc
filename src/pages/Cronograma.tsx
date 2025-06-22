
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ChevronUp, ChevronDown, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Define the activity type
interface ScheduleActivity {
  id: number;
  cronograma_atividade_id: number;
  atividade: string;
  local: string;
  modalidade_nome: string | null;
  modalidade_status: string | null;
  global: boolean;
  recorrente?: boolean;
  dias_semana?: string[];
  horarios_por_dia?: Record<string, { inicio: string; fim: string }>;
  locais_por_dia?: Record<string, string>;
  data_fim_recorrencia?: string;
  dia?: string;
  horario_inicio?: string;
  horario_fim?: string;
}

// Helper function to get day label in Portuguese
const getDayLabel = (dayKey: string): string => {
  const dayLabels: Record<string, string> = {
    'segunda': 'Segunda-feira',
    'terca': 'Terça-feira',
    'quarta': 'Quarta-feira',
    'quinta': 'Quinta-feira',
    'sexta': 'Sexta-feira',
    'sabado': 'Sábado',
    'domingo': 'Domingo'
  };
  return dayLabels[dayKey] || dayKey;
};

// Helper function to expand recurrent activities into daily activities
function expandRecurrentActivity(activity: ScheduleActivity): ScheduleActivity[] {
  if (!activity.recorrente || !activity.dias_semana || !Array.isArray(activity.dias_semana)) {
    return [activity];
  }

  const expandedActivities: ScheduleActivity[] = [];

  activity.dias_semana.forEach(dia => {
    const horario = activity.horarios_por_dia?.[dia];
    const local = activity.locais_por_dia?.[dia];
    
    if (horario) {
      expandedActivities.push({
        ...activity,
        dia: dia, // Use the day key directly
        horario_inicio: horario.inicio,
        horario_fim: horario.fim,
        local: local || activity.local || '',
        recorrente: false // Mark as non-recurrent for display purposes
      });
    }
  });

  return expandedActivities.length > 0 ? expandedActivities : [activity];
}

// Custom ActivityCard for the general schedule that always shows green status
function GeneralScheduleActivityCard({ category, activities }: {
  category: string;
  activities: ScheduleActivity[];
}) {
  const location = activities[0]?.local || '';
  const isGlobal = activities.some(activity => activity.global);
  const isRecurrent = activities.some(activity => activity.recorrente);

  return (
    <div className={cn(
      "p-3 rounded-lg border",
      isGlobal 
        ? "border-yellow-400 bg-yellow-50" 
        : "border-green-600 bg-green-50"
    )}>
      <div className="space-y-2">
        <h4 className="font-medium text-olimpics-green-primary">
          {activities[0].atividade}
          {isRecurrent && (
            <Badge variant="outline" className="ml-2 text-xs">
              Recorrente
            </Badge>
          )}
        </h4>
        <div className="pl-2 space-y-3">
          <div className="text-sm text-gray-600">
            <span>{location}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activities.map((activity) => {
              const displayName = activity.modalidade_nome || activity.atividade;
              return (
                <Badge 
                  key={`${activity.cronograma_atividade_id}-${activity.modalidade_nome}`}
                  variant="secondary"
                  className={cn(
                    "whitespace-nowrap",
                    activity.global
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80"
                      : "bg-green-100 text-green-800 hover:bg-green-100/80"
                  )}
                >
                  {displayName}
                  {activity.global && ' (Todos)'}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom ScheduleTable component for the general schedule
function GeneralScheduleTable({ groupedActivities, dates, timeSlots }: {
  groupedActivities: {
    [key: string]: {
      [key: string]: ScheduleActivity[];
    };
  };
  dates: string[];
  timeSlots: string[];
}) {
  if (!dates.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhuma atividade encontrada no cronograma.
      </div>
    );
  }

  const columnWidth = `${100 / (dates.length + 1)}%`;

  const groupByCategory = (activities: ScheduleActivity[]) => {
    const grouped = activities.reduce((acc, activity) => {
      const category = activity.atividade;
      
      if (!acc[category]) {
        acc[category] = [];
      }
      
      const isDuplicate = acc[category].some(
        existing => existing.cronograma_atividade_id === activity.cronograma_atividade_id &&
                    existing.modalidade_nome === activity.modalidade_nome
      );
      
      if (!isDuplicate) {
        acc[category].push(activity);
      }
      
      return acc;
    }, {} as Record<string, ScheduleActivity[]>);

    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th 
              className="border-b p-4 text-left font-semibold text-olimpics-green-primary"
              style={{ width: columnWidth }}
            >
              Horário
            </th>
            {dates.map((day) => (
              <th 
                key={day} 
                className="border-b p-4 text-left font-semibold text-olimpics-green-primary"
                style={{ width: columnWidth }}
              >
                {getDayLabel(day)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(timeSlot => {
            const [start, end] = timeSlot.split('-');
            return (
              <tr key={timeSlot} className="border-b last:border-b-0">
                <td className="p-4 align-top" style={{ width: columnWidth }}>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span className="whitespace-nowrap">
                      {start.slice(0, 5)} - {end.slice(0, 5)}
                    </span>
                  </div>
                </td>
                {dates.map((date) => {
                  const activitiesForSlot = groupedActivities[date]?.[timeSlot] || [];
                  const groupedByCategory = groupByCategory(activitiesForSlot);

                  return (
                    <td 
                      key={`${date}-${timeSlot}`} 
                      className="p-4 align-top"
                      style={{ width: columnWidth }}
                    >
                      <div className="space-y-2">
                        {groupedByCategory.map(([category, activities]) => (
                          <GeneralScheduleActivityCard 
                            key={category}
                            category={category}
                            activities={activities}
                          />
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Cronograma() {
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const currentEventId = localStorage.getItem('currentEventId');

  const { data: activities, isLoading } = useQuery({
    queryKey: ['cronograma-activities', currentEventId],
    queryFn: async () => {
      console.log('Fetching cronograma activities for event:', currentEventId);
      
      const { data, error } = await supabase
        .from('cronograma_atividades')
        .select(`
          id,
          atividade,
          dia,
          horario_inicio,
          horario_fim,
          local,
          global,
          recorrente,
          dias_semana,
          horarios_por_dia,
          locais_por_dia,
          data_fim_recorrencia,
          cronograma_atividade_modalidades(
            modalidade_id,
            modalidades(
              nome,
              status
            )
          )
        `)
        .eq('evento_id', currentEventId)
        .order('dia', { ascending: true })
        .order('horario_inicio', { ascending: true });

      if (error) {
        console.error('Error fetching cronograma:', error);
        throw error;
      }

      console.log('Raw cronograma data:', data);

      // Transform and expand the data
      const transformedActivities: ScheduleActivity[] = [];
      
      (data || []).forEach(item => {
        const modalidades = item.cronograma_atividade_modalidades || [];
        
        if (modalidades.length === 0) {
          // Activity without specific modalities
          const baseActivity: ScheduleActivity = {
            id: item.id,
            cronograma_atividade_id: item.id,
            atividade: item.atividade,
            dia: item.dia,
            horario_inicio: item.horario_inicio,
            horario_fim: item.horario_fim,
            local: item.local,
            global: item.global,
            modalidade_nome: null,
            modalidade_status: null,
            recorrente: item.recorrente || false,
            dias_semana: item.dias_semana || [],
            horarios_por_dia: item.horarios_por_dia || {},
            locais_por_dia: item.locais_por_dia || {},
            data_fim_recorrencia: item.data_fim_recorrencia || ''
          };
          
          // Expand recurrent activities
          const expandedActivities = expandRecurrentActivity(baseActivity);
          transformedActivities.push(...expandedActivities);
        } else {
          // Activity with specific modalities
          modalidades.forEach((mod: any) => {
            const baseActivity: ScheduleActivity = {
              id: item.id,
              cronograma_atividade_id: item.id,
              atividade: item.atividade,
              dia: item.dia,
              horario_inicio: item.horario_inicio,
              horario_fim: item.horario_fim,
              local: item.local,
              global: item.global,
              modalidade_nome: mod.modalidades?.nome || null,
              modalidade_status: mod.modalidades?.status || null,
              recorrente: item.recorrente || false,
              dias_semana: item.dias_semana || [],
              horarios_por_dia: item.horarios_por_dia || {},
              locais_por_dia: item.locais_por_dia || {},
              data_fim_recorrencia: item.data_fim_recorrencia || ''
            };
            
            // Expand recurrent activities
            const expandedActivities = expandRecurrentActivity(baseActivity);
            transformedActivities.push(...expandedActivities);
          });
        }
      });

      console.log('Transformed and expanded activities:', transformedActivities);
      return transformedActivities;
    },
    enabled: !!currentEventId,
  });

  // Group activities by date and time
  const groupedActivities = activities?.reduce((groups: any, activity) => {
    const date = activity.dia;
    const time = `${activity.horario_inicio}-${activity.horario_fim}`;
    
    if (!groups[date]) {
      groups[date] = {};
    }
    
    if (!groups[date][time]) {
      groups[date][time] = [];
    }
    
    groups[date][time].push(activity);
    
    return groups;
  }, {});

  // Get unique dates (now will include all days from recurrent activities)
  const dates = Object.keys(groupedActivities || {}).sort((a, b) => {
    // Sort days of week in logical order
    const dayOrder = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
    const indexA = dayOrder.indexOf(a);
    const indexB = dayOrder.indexOf(b);
    
    // If both are day keys, sort by day order
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    
    // If they're dates, sort alphabetically (which works for ISO dates)
    return a.localeCompare(b);
  });

  // Get unique time slots
  const timeSlots = [...new Set(
    activities?.map((activity: any) => `${activity.horario_inicio}-${activity.horario_fim}`)
  )].sort();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className={`transition-all duration-300 ease-in-out ${isVideoVisible ? 'h-[500px] opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}>
          <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.youtube.com/embed/OSHPBjTutP4?si=LKjz9U5obrt8f9ZI"
              title="Cronograma Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVideoVisible(!isVideoVisible)}
                className="absolute top-2 right-2 gap-2 bg-olimpics-green-primary text-white hover:bg-olimpics-green-secondary transition-colors font-medium"
              >
                {isVideoVisible ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Ocultar vídeo
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Mostrar vídeo
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isVideoVisible ? 'Clique para ocultar o vídeo' : 'Clique para mostrar o vídeo'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-olimpics-green-primary flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cronograma Geral do Evento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GeneralScheduleTable 
            groupedActivities={groupedActivities || {}}
            dates={dates}
            timeSlots={timeSlots}
          />
        </CardContent>
      </Card>
    </div>
  );
}
