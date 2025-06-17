
import { 
  BranchAnalytics, 
  ModalidadePopular, 
  StatusPagamento,
  StatusInscricao
} from "@/types/api";
import { BranchRegistrationData } from "./BranchRegistrationsChart";

/**
 * Calculates the total counts from the analytics data.
 */
export function calculateTotals(data: BranchAnalytics[]) {
  let totalGeral = 0;
  let totalModalidades = 0;
  let totalConfirmados = 0;
  let totalPendentes = 0;
  let totalCancelados = 0;
  let totalIsentos = 0; // Add exempt count

  data.forEach(branchData => {
    totalGeral += branchData.total_inscritos_geral;
    totalModalidades += branchData.total_inscritos_modalidades;

    // Sum up the counts for each payment status including exempt
    branchData.inscritos_por_status_pagamento.forEach(status => {
      if (status.status_pagamento === 'confirmado') {
        totalConfirmados += status.quantidade;
      } else if (status.status_pagamento === 'pendente') {
        totalPendentes += status.quantidade;
      } else if (status.status_pagamento === 'cancelado') {
        totalCancelados += status.quantidade;
      } else if (status.status_pagamento === 'isento') {
        totalIsentos += status.quantidade;
      }
    });
  });

  return {
    totalGeral,
    totalModalidades,
    totalConfirmados,
    totalPendentes,
    totalCancelados,
    totalIsentos
  };
}

/**
 * Transforms the analytics data to a format suitable for the modalities chart.
 * Correctly aggregates modalities by branch with accurate counts.
 */
export function transformModalitiesData(data: BranchAnalytics[]) {
  // Step 1: Collect all unique modalities and branch names first
  const modalityMap = new Map<string, {[branch: string]: number, total: number}>();
  
  // Get all filial names to ensure we have entries for all branches in each modality
  const allBranchNames = data.map(branch => branch.filial);
  
  // Process each branch's data
  data.forEach(branchData => {
    const branchName = branchData.filial;
    
    // Check if modalidades_populares exists and is in correct format
    if (!branchData.modalidades_populares || !Array.isArray(branchData.modalidades_populares)) {
      console.warn(`Missing or invalid modalidades_populares for branch ${branchName}`);
      return;
    }
    
    // Process each modality's data
    branchData.modalidades_populares.forEach(modalityData => {
      // Skip if the data structure is invalid
      if (typeof modalityData !== 'object' || !modalityData.modalidade || typeof modalityData.total_inscritos !== 'number') {
        console.warn(`Invalid modality data format in branch ${branchName}`, modalityData);
        return;
      }
      
      const modalityName = modalityData.modalidade;
      const inscriptions = modalityData.total_inscritos;
      
      // Initialize this modality in our map if it doesn't exist
      if (!modalityMap.has(modalityName)) {
        const initialData = { total: 0 };
        // Initialize with zero for all branches to ensure all branches appear in the chart
        allBranchNames.forEach(branch => {
          initialData[branch] = 0;
        });
        modalityMap.set(modalityName, initialData);
      }
      
      // Get the current data for this modality
      const currentModalityData = modalityMap.get(modalityName)!;
      
      // Add the count for this branch (replace any existing value)
      currentModalityData[branchName] = inscriptions;
      
      // Update the total count
      currentModalityData.total = 0; // Reset to recalculate total
      allBranchNames.forEach(branch => {
        currentModalityData.total += (currentModalityData[branch] || 0);
      });
    });
  });
  
  // Convert map to array format for the chart
  const transformedData = Array.from(modalityMap.entries()).map(([modalityName, branchCounts]) => {
    return {
      name: modalityName,
      ...branchCounts
    };
  });
  
  // Sort by total count (most popular first)
  return transformedData.sort((a, b) => b.total - a.total);
}

/**
 * Transforms the analytics data for the battery-style payment status chart
 */
export function transformPaymentStatusData(data: any[], colorMap: Record<string, string>) {
  // Extract and aggregate payment status data including exempt
  let totalConfirmado = 0;
  let totalPendente = 0;
  let totalCancelado = 0;
  let totalIsento = 0;
  
  data.forEach(branchData => {
    if (branchData.inscritos_por_status_pagamento && Array.isArray(branchData.inscritos_por_status_pagamento)) {
      branchData.inscritos_por_status_pagamento.forEach((status: StatusInscricao) => {
        if (status.status_pagamento === 'confirmado') {
          totalConfirmado += status.quantidade;
        } else if (status.status_pagamento === 'pendente') {
          totalPendente += status.quantidade;
        } else if (status.status_pagamento === 'cancelado') {
          totalCancelado += status.quantidade;
        } else if (status.status_pagamento === 'isento') {
          totalIsento += status.quantidade;
        }
      });
    }
  });
  
  const totalAll = totalConfirmado + totalPendente + totalCancelado + totalIsento;
  
  // For the battery chart we need percentages including exempt
  return [
    {
      name: "Status de Pagamento",
      confirmado: totalConfirmado,
      pendente: totalPendente,
      cancelado: totalCancelado,
      isento: totalIsento,
      total: totalAll,
      // Calculate percentages for the battery visualization
      confirmadoPct: totalAll > 0 ? (totalConfirmado / totalAll) * 100 : 0,
      pendentePct: totalAll > 0 ? (totalPendente / totalAll) * 100 : 0,
      canceladoPct: totalAll > 0 ? (totalCancelado / totalAll) * 100 : 0,
      isentoPct: totalAll > 0 ? (totalIsento / totalAll) * 100 : 0
    }
  ];
}

/**
 * Transforms the analytics data to a format suitable for the branch registrations chart.
 */
export function transformBranchRegistrationsData(data: BranchAnalytics[]): BranchRegistrationData[] {
  return data.map(branchData => ({
    name: branchData.filial,
    confirmados: branchData.inscritos_por_status_pagamento.find(status => status.status_pagamento === 'confirmado')?.quantidade || 0,
    pendentes: branchData.inscritos_por_status_pagamento.find(status => status.status_pagamento === 'pendente')?.quantidade || 0,
    isentos: branchData.inscritos_por_status_pagamento.find(status => status.status_pagamento === 'isento')?.quantidade || 0,
    total: branchData.total_inscritos_geral
  }));
}
