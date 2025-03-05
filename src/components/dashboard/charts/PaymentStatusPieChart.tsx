
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChartContainer, ChartLegendContent } from "@/components/ui/chart";
import { EmptyChartMessage } from "./EmptyChartMessage";
import { CustomTooltip } from "./CustomTooltip";

interface PaymentStatusData {
  name: string;
  value: number;
  color: string;
}

interface PaymentStatusPieChartProps {
  data: PaymentStatusData[];
  chartConfig: any;
}

export function PaymentStatusPieChart({ data, chartConfig }: PaymentStatusPieChartProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Status de Pagamento</CardTitle>
        <CardDescription>
          Distribuição dos pagamentos por status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => 
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                  content={<ChartLegendContent />}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <EmptyChartMessage message="Sem dados de status de pagamento disponíveis" />
        )}
      </CardContent>
    </Card>
  );
}
