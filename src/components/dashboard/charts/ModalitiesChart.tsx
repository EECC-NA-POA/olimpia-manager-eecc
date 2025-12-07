import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Bar, 
  ResponsiveContainer, 
  Legend, 
  CartesianGrid 
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { EmptyChartMessage } from "./EmptyChartMessage";
import { CustomTooltip } from "./CustomTooltip";
import { useIsMobile } from "@/hooks/use-mobile";

interface ModalitiesChartProps {
  data: any[];
  chartColors: Record<string, string>;
  chartConfig: any;
}

// Custom colors for branches
const BRANCH_COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", 
  "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57",
  "#e85de2", "#6d58f5", "#fa7f72", "#36a2eb", "#4bc0c0"
];

export function ModalitiesChart({ data, chartColors, chartConfig }: ModalitiesChartProps) {
  const isMobile = useIsMobile();
  
  // Limit data on mobile for better readability
  const displayData = isMobile ? data.slice(0, 6) : data;
  const hasMoreData = isMobile && data.length > 6;

  if (!data || data.length === 0) {
    return (
      <Card className="hover:shadow-lg transition-shadow w-full">
        <CardHeader>
          <CardTitle>Modalidades Mais Populares</CardTitle>
          <CardDescription>
            Modalidades com maior número de inscrições por filial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyChartMessage message="Sem dados de modalidades disponíveis" />
        </CardContent>
      </Card>
    );
  }

  // Get all unique branch names from the data
  const branchNames = new Set<string>();
  
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (key !== 'name' && key !== 'total') {
        branchNames.add(key);
      }
    });
  });

  // Sort branch names alphabetically
  const sortedBranchNames = Array.from(branchNames).sort();

  return (
    <Card className="hover:shadow-lg transition-shadow w-full overflow-hidden">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="text-sm sm:text-lg">Modalidades Mais Populares</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {hasMoreData 
            ? `Top 6 modalidades (de ${data.length} total)`
            : "Modalidades com maior número de inscrições por filial"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full p-1 sm:p-6 overflow-x-auto">
        <div className="min-w-[350px]">
        <ChartContainer config={chartConfig} className="h-[350px] sm:h-[550px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={displayData} 
              margin={{ top: 20, right: isMobile ? 10 : 40, left: isMobile ? 10 : 40, bottom: isMobile ? 60 : 100 }}
              barCategoryGap={isMobile ? 8 : 15}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={isMobile ? 60 : 100} 
                interval={0}
                tick={{ fontSize: isMobile ? 8 : 12 }}
              />
              <YAxis 
                label={{ 
                  value: 'Inscrições', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontSize: isMobile ? 9 : 12 },
                  offset: isMobile ? 5 : -10
                }}
                tick={{ fontSize: isMobile ? 8 : 11 }}
                width={isMobile ? 30 : 60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top"
                wrapperStyle={{ 
                  paddingBottom: isMobile ? 8 : 20,
                  fontSize: isMobile ? '8px' : '12px',
                  overflowX: 'auto',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center'
                }}
                layout="horizontal"
                iconSize={isMobile ? 8 : 14}
              />
              
              {sortedBranchNames.map((branchName, index) => (
                <Bar 
                  key={branchName}
                  dataKey={branchName} 
                  name={branchName} 
                  stackId="a"
                  fill={BRANCH_COLORS[index % BRANCH_COLORS.length]} 
                  radius={[index === 0 ? 4 : 0, index === sortedBranchNames.length - 1 ? 4 : 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
