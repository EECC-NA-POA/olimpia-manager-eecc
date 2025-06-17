
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAttendanceByAthlete } from "@/hooks/useSessionAttendance";

interface AttendanceChartProps {
  modalidadeRepId: string | null;
}

export default function AttendanceChart({ modalidadeRepId }: AttendanceChartProps) {
  const { data: attendanceData, isLoading } = useAttendanceByAthlete(modalidadeRepId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Carregando dados de assiduidade...</p>
        </CardContent>
      </Card>
    );
  }

  if (!attendanceData || Object.keys(attendanceData).length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Nenhum dado de assiduidade encontrado</p>
        </CardContent>
      </Card>
    );
  }

  // Preparar dados para o gráfico
  const chartData = React.useMemo(() => {
    const allMonths = new Set<string>();
    const athletes = Object.keys(attendanceData);
    
    // Coletar todos os meses únicos
    athletes.forEach(athlete => {
      Object.keys(attendanceData[athlete]).forEach(month => {
        allMonths.add(month);
      });
    });

    const sortedMonths = Array.from(allMonths).sort();
    
    // Criar dados do gráfico
    return sortedMonths.map(month => {
      const monthData: any = { month };
      
      athletes.forEach(athlete => {
        const atletaData = attendanceData[athlete][month];
        if (atletaData) {
          // Calcular taxa de presença (presente + atrasado) / total
          const presenceRate = ((atletaData.presente + atletaData.atrasado) / atletaData.total) * 100;
          monthData[athlete] = Math.round(presenceRate);
        } else {
          monthData[athlete] = 0;
        }
      });
      
      return monthData;
    });
  }, [attendanceData]);

  const athletes = Object.keys(attendanceData);
  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
    '#ff0000', '#0000ff', '#ff00ff', '#00ffff', '#ffff00'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gráfico de Assiduidade por Atleta</CardTitle>
        <p className="text-sm text-gray-500">
          Taxa de presença (%) por mês - inclui presenças e atrasos
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                label={{ value: 'Taxa de Presença (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [`${value}%`, name]}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Legend />
              {athletes.map((athlete, index) => (
                <Line
                  key={athlete}
                  type="monotone"
                  dataKey={athlete}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {athletes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum atleta encontrado para esta modalidade
          </div>
        )}
      </CardContent>
    </Card>
  );
}
