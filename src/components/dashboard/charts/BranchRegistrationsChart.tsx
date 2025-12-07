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
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  // Limit data on mobile for better readability
  const displayData = isMobile ? data.slice(0, 5) : data;
  const hasMoreData = isMobile && data.length > 5;

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
    <Card className="hover:shadow-lg transition-shadow w-full overflow-hidden">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="text-sm sm:text-lg">Inscrições por Filial</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {hasMoreData 
            ? `Top 5 filiais (de ${data.length} total) - role para ver gráfico completo`
            : "Filiais com maior número de inscrições por status"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="p-1 sm:p-6 overflow-x-auto">
        <div className="min-w-[300px] sm:min-w-[400px]">
          <ChartContainer config={chartConfig} className="h-[300px] sm:h-[500px] lg:h-[600px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={displayData}
              margin={{ top: 15, right: 2, left: -5, bottom: isMobile ? 50 : 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={70}
                interval={0}
                tick={{ fontSize: 8 }}
                className="text-[8px] sm:text-xs"
              />
              <YAxis 
                yAxisId="left"
                label={{ 
                  value: 'Inscrições', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontSize: '9px' },
                  offset: 10
                }}
                tick={{ fontSize: 8 }}
                width={35}
                className="text-[8px] sm:text-xs"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                wrapperStyle={{ 
                  paddingBottom: 8,
                  fontSize: '9px',
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%'
                }}
                layout="horizontal"
                iconSize={8}
              />
              
              {/* Total bar showing combined value */}
              <Bar 
                yAxisId="left"
                dataKey="total" 
                name="Total" 
                fill={chartColors.blue} 
                barSize={15}
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
        </div>
      </CardContent>
    </Card>
  );
}
