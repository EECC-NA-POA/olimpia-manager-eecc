
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
import { useAuth } from '@/contexts/AuthContext';

// Define the activity type
interface ScheduleActivity {
  id: string;
  evento_id: string;
  titulo: string;
  descricao: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  local: string;
  tipo: string;
}

// Custom ActivityCard for the general schedule that always shows green status
function GeneralScheduleActivityCard({ activity }: {
  activity: ScheduleActivity;
}) {
  return (
    <div className="p-3 rounded-lg border border-green-600 bg-green-50">
      <div className="space-y-2">
        <h4 className="font-medium text-olimpics-green-primary">{activity.titulo}</h4>
        <div className="pl-2 space-y-3">
          {activity.descricao && (
            <div className="text-sm text-gray-700">
              {activity.descricao}
            </div>
          )}
          <div className="text-sm text-gray-600">
            <span>{activity.local}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="secondary"
              className="bg-green-100 text-green-800 hover:bg-green-100/80 whitespace-nowrap"
            >
              {activity.tipo}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom ScheduleTable component for the general schedule
function GeneralScheduleTable({ activities }: {
  activities: ScheduleActivity[];
}) {
  if (!activities.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhuma atividade encontrada no cronograma.
      </div>
    );
  }

  // Group activities by date
  const groupedByDate: Record<string, ScheduleActivity[]> = {};
  
  activities.forEach(activity => {
    const date = activity.data;
    if (!groupedByDate[date]) {
      groupedByDate[date] = [];
    }
    groupedByDate[date].push(activity);
  });

  // Sort dates
  const dates = Object.keys(groupedByDate).sort();

  return (
    <div className="space-y-8">
      {dates.map(date => (
        <div key={date} className="space-y-4">
          <h3 className="text-lg font-semibold text-olimpics-green-primary border-b pb-2">
            {new Date(date).toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            {groupedByDate[date]
              .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
              .map(activity => (
                <div key={activity.id} className="flex gap-4">
                  <div className="w-20 flex-shrink-0">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span className="whitespace-nowrap">
                        {activity.hora_inicio.slice(0, 5)}
                        {activity.hora_fim && ` - ${activity.hora_fim.slice(0, 5)}`}
                      </span>
                    </div>
                  </div>
                  <GeneralScheduleActivityCard activity={activity} />
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Cronograma() {
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const { currentEventId } = useAuth();

  const { data: activities, isLoading } = useQuery({
    queryKey: ['cronograma-activities', currentEventId],
    queryFn: async () => {
      console.log('Fetching cronograma activities for event:', currentEventId);
      
      // Fetch from the correct 'cronogramas' table
      const { data, error } = await supabase
        .from('cronogramas')
        .select('*')
        .eq('evento_id', currentEventId)
        .order('data')
        .order('hora_inicio');

      if (error) {
        console.error('Error fetching cronograma:', error);
        throw error;
      }

      console.log('Retrieved cronograma activities:', data);
      return data || [];  // Ensure we always return an array
    },
    enabled: !!currentEventId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
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
          <GeneralScheduleTable activities={activities} />
        </CardContent>
      </Card>
    </div>
  );
}
