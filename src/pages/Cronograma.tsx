
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Loader2 } from "lucide-react";
import { GeneralScheduleTable } from "@/components/cronograma/GeneralScheduleTable";
import { useCronogramaData } from "@/components/cronograma/useCronogramaData";

export default function Cronograma() {
  const { isLoading, groupedActivities, dates, timeSlots } = useCronogramaData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-6">
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 max-w-full overflow-x-hidden">
        <Card className="w-full">
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-olimpics-green-primary flex items-center gap-2 text-lg sm:text-xl">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">Cronograma Geral do Evento</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <GeneralScheduleTable 
              groupedActivities={groupedActivities}
              dates={dates}
              timeSlots={timeSlots}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
