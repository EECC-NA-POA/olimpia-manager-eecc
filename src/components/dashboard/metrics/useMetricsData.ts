
import { BranchAnalytics } from "@/lib/api";
import { PaymentStatus } from "./types";

export function useMetricsData(data: BranchAnalytics[]) {
  console.log('Analytics data received:', data); // Debug log

  // Calculate total unique athletes
  const totalAthletes = data.reduce((acc, branch) => {
    console.log('Branch total_inscritos_geral:', branch.total_inscritos_geral);
    return acc + (Number(branch.total_inscritos_geral) || 0);
  }, 0);
  
  // Calculate payment status totals
  const paymentTotals = data.reduce((acc, branch) => {
    console.log('Branch total_inscritos_por_status:', branch.total_inscritos_por_status);
    const statusData = branch.total_inscritos_por_status || [];
    
    statusData.forEach((status) => {
      if (status.status_pagamento === 'confirmado') {
        acc.confirmed += Number(status.quantidade) || 0;
      } else if (status.status_pagamento === 'pendente') {
        acc.pending += Number(status.quantidade) || 0;
      }
    });
    
    return acc;
  }, { confirmed: 0, pending: 0 });

  // Calculate revenue totals
  const totalRevenuePaid = data.reduce((acc, branch) => {
    console.log('Branch valor_total_pago:', branch.valor_total_pago);
    return acc + (Number(branch.valor_total_pago) || 0);
  }, 0);

  console.log('Calculated metrics:', {
    totalAthletes,
    totalRevenuePaid,
    paymentTotals
  });

  return {
    totalAthletes,
    totalRevenuePaid,
    totalRevenuePending: 0, // Since this isn't in the view currently
    totalAthletesPendingPayment: paymentTotals.pending
  };
}
