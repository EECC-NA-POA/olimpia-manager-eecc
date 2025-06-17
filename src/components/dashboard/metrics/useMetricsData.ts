
import { BranchAnalytics } from "@/lib/api";
import { PaymentStatus } from "./types";

export function useMetricsData(data: BranchAnalytics[]) {
  console.log('Analytics data received:', data); // Debug log

  // Calculate total unique athletes including dependents
  const totalAthletes = data.reduce((acc, branch) => {
    console.log('Branch total_inscritos_geral:', branch.total_inscritos_geral);
    // Ensure we're counting all registered users including dependents
    return acc + (Number(branch.total_inscritos_geral) || 0);
  }, 0);
  
  // Calculate payment status totals including dependents
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

  // Calculate pending revenue
  const totalRevenuePending = data.reduce((acc, branch) => {
    console.log('Branch valor_total_pendente:', branch.valor_total_pendente);
    return acc + (Number(branch.valor_total_pendente) || 0);
  }, 0);

  console.log('Calculated metrics:', {
    totalAthletes,
    totalRevenuePaid,
    totalRevenuePending,
    paymentTotals
  });

  return {
    totalAthletes,
    totalRevenuePaid,
    totalRevenuePending,
    totalAthletesPendingPayment: paymentTotals.pending
  };
}
