
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { AthleteForAttendance } from "@/hooks/useSessionAttendance";
import { AthleteAttendanceCard } from "./AthleteAttendanceCard";

interface AthletesListProps {
  athletes: AthleteForAttendance[];
  attendanceData: Map<string, { status: string; attendance_id?: string }>;
  onStatusChange: (athleteId: string, status: string) => void;
}

export function AthletesList({ athletes, attendanceData, onStatusChange }: AthletesListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" />
          Lista de Presença ({athletes.length} atletas)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {athletes.map((athlete) => {
            const data = attendanceData.get(athlete.id) || { status: 'presente' };
            return (
              <AthleteAttendanceCard
                key={athlete.id}
                athlete={athlete}
                status={data.status}
                onStatusChange={onStatusChange}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
