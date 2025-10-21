
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Line
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { EmptyChartMessage } from "./EmptyChartMessage";
import { CustomTooltip } from "./CustomTooltip";

export interface BranchRegistrationData {
  name: string;
  confirmados: number;
  pendentes: number;
  isentos?: number;
  total: number;
}

interface BranchRegistrationsChartProps {
  data: BranchRegistrationData[];
  chartColors: Record<string, string>;
  chartConfig: any;
}

export function BranchRegistrationsChart({ data, chartColors, chartConfig }: BranchRegistrationsChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="hover:shadow-lg transition-shadow w-full">
        <CardHeader>
          <CardTitle>Inscrições por Filial</CardTitle>
          <CardDescription>
            Distribuição de inscrições por filial e status de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyChartMessage message="Sem dados de inscrições por filial disponíveis" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow w-full">
      <CardHeader>
        <CardTitle>Inscrições por Filial</CardTitle>
        <CardDescription>
          Filiais com maior número de inscrições por status
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <ChartContainer config={chartConfig} className="h-[400px] sm:h-[500px] lg:h-[600px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 20, right: 5, left: 0, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                interval={0}
                tick={{ fontSize: 9 }}
              />
              <YAxis 
                yAxisId="left"
                label={{ 
                  value: 'Inscrições', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontSize: '10px' },
                  offset: 5
                }}
                tick={{ fontSize: 9 }}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                wrapperStyle={{ 
                  paddingBottom: 10,
                  fontSize: '10px',
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%'
                }}
                layout="horizontal"
                iconSize={10}
              />
              
              {/* Total bar showing combined value */}
              <Bar 
                yAxisId="left"
                dataKey="total" 
                name="Total" 
                fill={chartColors.blue} 
                barSize={20}
                radius={[4, 4, 0, 0]}
              />
              
              {/* Lines for detailed breakdown */}
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="confirmados" 
                name="Confirmados" 
                stroke={chartColors.green} 
                strokeWidth={1.5} 
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="pendentes" 
                name="Pendentes" 
                stroke={chartColors.yellow} 
                strokeWidth={1.5} 
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                strokeDasharray="5 5"
              />
              {/* Add line for exempt athletes if data exists */}
              {data.some(item => item.isentos && item.isentos > 0) && (
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="isentos" 
                  name="Isentos" 
                  stroke={chartColors.blue} 
                  strokeWidth={1.5} 
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  strokeDasharray="10 5"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
