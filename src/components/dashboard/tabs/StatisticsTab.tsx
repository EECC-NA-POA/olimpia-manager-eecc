
import { BranchAnalytics } from "@/types/api";
import { SummaryCards } from "../charts/SummaryCards";
import { PaymentStatusBarChart } from "../charts/PaymentStatusBarChart";
import { BranchRegistrationsChart } from "../charts/BranchRegistrationsChart";
import { 
  calculateTotals, 
  transformPaymentStatusData, 
  transformBranchRegistrationsData 
} from "../charts/dataTransformers";
import { ChartConfig } from "@/components/ui/chart/types";

// Define a consistent color palette
const CHART_COLORS = {
  green: '#10B981',
  yellow: '#F59E0B',
  red: '#EF4444',
  blue: '#6366F1',
  purple: '#8B5CF6',
  pink: '#EC4899'
};

const PAYMENT_STATUS_COLORS = {
  'confirmado': CHART_COLORS.green,
  'pendente': CHART_COLORS.yellow,
  'cancelado': CHART_COLORS.red,
  'isento': CHART_COLORS.blue
};

// Chart config that matches the ChartConfig type
const CHART_CONFIG: ChartConfig = {
  modalities: {
    color: CHART_COLORS.blue,
    label: 'Modalidades'
  },
  confirmado: {
    color: CHART_COLORS.green,
    label: 'Confirmado'
  },
  pendente: {
    color: CHART_COLORS.yellow,
    label: 'Pendente'
  },
  cancelado: {
    color: CHART_COLORS.red,
    label: 'Cancelado'
  },
  isento: {
    color: CHART_COLORS.blue,
    label: 'Isento'
  },
  categories: {
    color: CHART_COLORS.purple,
    label: 'Categorias'
  },
  total: {
    color: CHART_COLORS.blue,
    label: 'Total'
  }
};

interface StatisticsTabProps {
  data: BranchAnalytics[];
  currentBranchId?: string;
}

export function StatisticsTab({ data, currentBranchId }: StatisticsTabProps) {
  console.log("StatisticsTab data:", data);
  console.log("currentBranchId:", currentBranchId);
  
  // Check if data is valid and properly structured 
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 sm:h-64 px-2 sm:px-4">
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground text-center">Não há dados estatísticos disponíveis</p>
        <p className="text-xs sm:text-sm text-muted-foreground text-center mt-1">Verifique se existem inscrições registradas para este evento</p>
      </div>
    );
  }

  // Filter data by branch if we're in delegation view
  const filteredData = currentBranchId 
    ? data.filter(item => item.filial_id === currentBranchId)
    : data;
    
  console.log("Filtered data for statistics:", filteredData);

  // If no data after filtering, show no data message
  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 sm:h-64 px-2 sm:px-4">
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground text-center">Não há dados estatísticos disponíveis para esta filial</p>
        <p className="text-xs sm:text-sm text-muted-foreground text-center mt-1">Verifique se existem inscrições confirmadas para esta filial</p>
      </div>
    );
  }

  // Calculate totals
  const calculatedTotals = calculateTotals(filteredData);
  console.log("Calculated totals:", calculatedTotals);

  // For delegation view, use the single branch record to avoid duplicate aggregation
  const branchRecord = currentBranchId ? (filteredData.find(item => item.filial_id === currentBranchId) ?? filteredData[0]) : undefined;

  // Map the calculated totals to the format expected by SummaryCards
  const summaryCardsTotals = currentBranchId && branchRecord
    ? {
        inscricoes: Number(branchRecord.total_inscritos_geral) || 0,
        pago: Number(branchRecord.valor_total_pago) || 0,
        pendente: Number(branchRecord.valor_total_pendente) || 0,
        isento: branchRecord.inscritos_por_status_pagamento?.find(s => s.status_pagamento === 'isento')?.quantidade || 0
      }
    : {
        inscricoes: calculatedTotals.totalGeral,
        pago: filteredData.reduce((sum, branch) => sum + (Number(branch.valor_total_pago) || 0), 0),
        pendente: filteredData.reduce((sum, branch) => sum + (Number(branch.valor_total_pendente) || 0), 0),
        isento: calculatedTotals.totalIsentos
      };
  console.log("Summary cards totals:", summaryCardsTotals);

  // Transform data for charts
  const paymentStatusData = transformPaymentStatusData(filteredData, PAYMENT_STATUS_COLORS);
  console.log("Payment status chart data:", paymentStatusData);

  const branchRegistrationsData = transformBranchRegistrationsData(filteredData);
  console.log("Branch registrations chart data:", branchRegistrationsData);

  return (
    <div className="space-y-3 sm:space-y-6 lg:space-y-8 px-1 sm:px-2 lg:px-0">
      {/* Summary Cards Section */}
      <div className="w-full">
        <SummaryCards totals={summaryCardsTotals} />
      </div>

      {/* Charts Section - Mobile optimized layout */}
      <div className="space-y-3 sm:space-y-6 lg:space-y-8">
        {/* Payment Status Bar Chart - Full width */}
        <div className="w-full overflow-hidden">
          <PaymentStatusBarChart 
            data={paymentStatusData} 
            chartConfig={CHART_CONFIG} 
            title="Status de Pagamento"
            description="Distribuição dos pagamentos por status"
          />
        </div>

        {/* Branch Registrations Chart - Full width */}
        <div className="w-full overflow-hidden">
          <BranchRegistrationsChart 
            data={branchRegistrationsData} 
            chartColors={CHART_COLORS} 
            chartConfig={CHART_CONFIG} 
          />
        </div>
      </div>
    </div>
  );
}
