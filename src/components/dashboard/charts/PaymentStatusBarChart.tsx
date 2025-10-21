
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  CartesianGrid,
  Cell
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { EmptyChartMessage } from "./EmptyChartMessage";
import { CustomTooltip } from "./CustomTooltip";
import { Progress } from "@/components/ui/progress";

interface PaymentStatusData {
  name: string;
  confirmado: number;
  pendente: number;
  cancelado: number;
  total: number;
  confirmadoPct: number;
  pendentePct: number;
  canceladoPct: number;
}

interface PaymentStatusBarChartProps {
  data: PaymentStatusData[];
  chartConfig: any;
  title?: string;
  description?: string;
}

export function PaymentStatusBarChart({ 
  data, 
  chartConfig,
  title = "Status de Pagamento",
  description = "Distribuição dos pagamentos por status"
}: PaymentStatusBarChartProps) {
  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <Card className="hover:shadow-lg transition-shadow w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyChartMessage message="Sem dados de status de pagamento disponíveis" />
        </CardContent>
      </Card>
    );
  }

  // Extract percentages from the first data item
  const { confirmadoPct = 0, pendentePct = 0, canceladoPct = 0 } = data[0];
  
  // Format numbers for display
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          {/* Battery-style visualization */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-xs sm:text-sm font-medium">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                Confirmado: {formatNumber(data[0].confirmado)} ({confirmadoPct.toFixed(1)}%)
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
                Pendente: {formatNumber(data[0].pendente)} ({pendentePct.toFixed(1)}%)
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                Cancelado: {formatNumber(data[0].cancelado)} ({canceladoPct.toFixed(1)}%)
              </div>
            </div>
            
            {/* The battery visualization */}
            <div className="relative h-8 sm:h-10 w-full rounded-full bg-gray-200 overflow-hidden">
              {/* Confirmed segment */}
              <div 
                className="absolute left-0 top-0 h-full bg-green-500" 
                style={{ width: `${confirmadoPct}%` }}
              ></div>
              
              {/* Pending segment */}
              <div 
                className="absolute top-0 h-full bg-yellow-500" 
                style={{ 
                  left: `${confirmadoPct}%`, 
                  width: `${pendentePct}%` 
                }}
              ></div>
              
              {/* Canceled segment */}
              <div 
                className="absolute top-0 h-full bg-red-500" 
                style={{ 
                  left: `${confirmadoPct + pendentePct}%`, 
                  width: `${canceladoPct}%` 
                }}
              ></div>
            </div>
            
            <div className="text-center text-xs sm:text-sm text-muted-foreground">
              Total de Inscrições: {formatNumber(data[0].total)}
            </div>
          </div>

          {/* Additional detailed breakdown using horizontal bars */}
          <div className="h-[200px] sm:h-[250px] pt-4">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Confirmado', value: data[0].confirmado, color: '#10B981' },
                    { name: 'Pendente', value: data[0].pendente, color: '#F59E0B' },
                    { name: 'Cancelado', value: data[0].cancelado, color: '#EF4444' }
                  ]}
                  layout="vertical"
                  margin={{ top: 10, right: 5, left: 5, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis 
                    type="number" 
                    label={{ value: 'Inscrições', position: 'insideBottom', offset: -5, className: 'text-xs sm:text-sm' }} 
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="value" 
                    name="Quantidade" 
                    barSize={30}
                    radius={[0, 4, 4, 0]}
                  >
                    {[
                      { name: 'Confirmado', value: data[0].confirmado, color: '#10B981' },
                      { name: 'Pendente', value: data[0].pendente, color: '#F59E0B' },
                      { name: 'Cancelado', value: data[0].cancelado, color: '#EF4444' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
