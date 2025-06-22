
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface AthleteAttendance {
  id: string;
  status: 'presente' | 'ausente' | 'atrasado';
}

interface AttendanceStatusSummaryProps {
  athletesAttendance: AthleteAttendance[];
}

export default function AttendanceStatusSummary({ athletesAttendance }: AttendanceStatusSummaryProps) {
  if (athletesAttendance.length === 0) {
    return null;
  }

  const presente = athletesAttendance.filter(a => a.status === 'presente').length;
  const ausente = athletesAttendance.filter(a => a.status === 'ausente').length;
  const atrasado = athletesAttendance.filter(a => a.status === 'atrasado').length;
  const total = athletesAttendance.length;

  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      <Card>
        <CardContent className="p-3 text-center">
          <div className="text-lg font-bold text-olimpics-green-primary">{total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 text-center">
          <div className="text-lg font-bold text-green-600">{presente}</div>
          <div className="text-xs text-gray-500">Presentes</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 text-center">
          <div className="text-lg font-bold text-yellow-600">{atrasado}</div>
          <div className="text-xs text-gray-500">Atrasados</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 text-center">
          <div className="text-lg font-bold text-red-600">{ausente}</div>
          <div className="text-xs text-gray-500">Ausentes</div>
        </CardContent>
      </Card>
    </div>
  );
}
