
import React, { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Loader2 } from "lucide-react";
import { ScheduleTable } from './schedule/ScheduleTable';
import { useAuth } from "@/contexts/AuthContext";
import { expandRecurrentActivity, getDayLabel } from '@/components/cronograma/utils';
import { ScheduleActivity, GroupedActivities } from '@/components/cronograma/types';

export default function AthleteSchedule() {
  const { user } = useAuth();
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  useEffect(() => {
    const eventId = localStorage.getItem('currentEventId');
    if (eventId) {
      setCurrentEventId(eventId);
    }
    console.log('Current event ID from localStorage:', eventId);
  }, []);

  const { data: activities, isLoading } = useQuery({
    queryKey: ['personal-schedule-activities', user?.id, currentEventId],
    queryFn: async () => {
      if (!user?.id || !currentEventId) return [];
      console.log('Fetching schedule activities for user:', user.id, 'event:', currentEventId);

      // First, fetch from the view for confirmed activities
      const { data: viewData, error: viewError } = await supabase
        .from('vw_cronograma_atividades_por_atleta')
        .select('*')
        .eq('evento_id', currentEventId)
        .or(`global.eq.true,and(atleta_id.eq.${user.id},modalidade_status.eq.confirmado)`)
        .order('dia')
        .order('horario_inicio');

      if (viewError) {
        console.error('Error fetching activities from view:', viewError);
      }

      // Also fetch global activities directly from cronograma_atividades
      const { data: globalData, error: globalError } = await supabase
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
          data_fim_recorrencia
        `)
        .eq('evento_id', currentEventId)
        .eq('global', true)
        .order('dia', { ascending: true })
        .order('horario_inicio', { ascending: true });

      if (globalError) {
        console.error('Error fetching global activities:', globalError);
      }

      console.log('View data:', viewData);
      console.log('Global data:', globalData);
      
      // Transform and expand the data
      const transformedActivities: ScheduleActivity[] = [];
      
      // Process view data (user-specific activities)
      (viewData || []).forEach(item => {
        const baseActivity: ScheduleActivity = {
          id: item.cronograma_atividade_id,
          cronograma_atividade_id: item.cronograma_atividade_id,
          atividade: item.atividade,
          dia: item.dia,
          horario_inicio: item.horario_inicio,
          horario_fim: item.horario_fim,
          local: item.local,
          global: item.global,
          modalidade_nome: item.modalidade_nome,
          modalidade_status: item.modalidade_status,
          atleta_id: item.atleta_id,
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

      // Process global activities separately
      (globalData || []).forEach(item => {
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
          atleta_id: user.id,
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

      // Remove duplicates based on cronograma_atividade_id and dia
      const uniqueActivities = transformedActivities.filter((activity, index, array) => {
        return array.findIndex(a => 
          a.cronograma_atividade_id === activity.cronograma_atividade_id && 
          a.dia === activity.dia &&
          a.horario_inicio === activity.horario_inicio
        ) === index;
      });

      console.log('Final transformed and expanded activities:', uniqueActivities);
      return uniqueActivities;
    },
    enabled: !!user?.id && !!currentEventId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  // Group activities by date and time
  const groupedActivities = activities?.reduce((groups: GroupedActivities, activity) => {
    const date = activity.dia || '';
    const time = `${activity.horario_inicio || ''}-${activity.horario_fim || ''}`;
    
    if (!groups[date]) {
      groups[date] = {};
    }
    
    if (!groups[date][time]) {
      groups[date][time] = [];
    }
    
    groups[date][time].push({
      ...activity,
      id: activity.cronograma_atividade_id
    });
    
    return groups;
  }, {});

  // Get unique dates and sort them properly (now includes all days from recurrent activities)
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

  const timeSlots = [...new Set(
    (activities || []).map(activity => `${activity.horario_inicio || ''}-${activity.horario_fim || ''}`)
  )].sort();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-olimpics-green-primary flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Meu Cronograma de Atividades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScheduleTable 
          groupedActivities={groupedActivities || {}}
          dates={dates}
          timeSlots={timeSlots}
        />
      </CardContent>
    </Card>
  );
}
