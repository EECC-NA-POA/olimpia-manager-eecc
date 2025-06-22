
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface AttendanceSummaryCardsProps {
  counts: {
    total: number;
    presente: number;
    atrasado: number;
    ausente: number;
  };
}

export function AttendanceSummaryCards({ counts }: AttendanceSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
      <Card>
        <CardContent className="p-3 sm:p-4 text-center">
          <div className="text-lg sm:text-2xl font-bold text-olimpics-green-primary">{counts.total}</div>
          <div className="text-xs sm:text-sm text-gray-500">Total</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 sm:p-4 text-center">
          <div className="text-lg sm:text-2xl font-bold text-green-600">{counts.presente}</div>
          <div className="text-xs sm:text-sm text-gray-500">Presentes</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 sm:p-4 text-center">
          <div className="text-lg sm:text-2xl font-bold text-yellow-600">{counts.atrasado}</div>
          <div className="text-xs sm:text-sm text-gray-500">Atrasados</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 sm:p-4 text-center">
          <div className="text-lg sm:text-2xl font-bold text-red-600">{counts.ausente}</div>
          <div className="text-xs sm:text-sm text-gray-500">Ausentes</div>
        </CardContent>
      </Card>
    </div>
  );
}
