
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Loader2 } from "lucide-react";
import { VideoSection } from "@/components/cronograma/VideoSection";
import { GeneralScheduleTable } from "@/components/cronograma/GeneralScheduleTable";
import { useCronogramaData } from "@/components/cronograma/useCronogramaData";

export default function Cronograma() {
  const { isLoading, groupedActivities, dates, timeSlots } = useCronogramaData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <VideoSection />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-olimpics-green-primary flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cronograma Geral do Evento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GeneralScheduleTable 
            groupedActivities={groupedActivities}
            dates={dates}
            timeSlots={timeSlots}
          />
        </CardContent>
      </Card>
    </div>
  );
}
