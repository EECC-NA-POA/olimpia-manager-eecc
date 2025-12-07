
import { AthleteManagement } from "@/types/api";
import { AthleteFilters } from "../AthleteFilters";
import { PaginatedAthleteList } from "../PaginatedAthleteList";
import { updateModalityStatus } from "@/lib/api/modalities";
import { updatePaymentStatus } from "@/lib/api/payments";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { EnrollmentType } from "@/hooks/useEnrollAthleteInModality";

interface AthletesTabProps {
  athletes: AthleteManagement[];
  branches: { id: string; nome: string; }[];
  currentUserId?: string;
  currentEventId: string;
  filters: {
    nameFilter: string;
    branchFilter: string;
    paymentStatusFilter: string;
  };
  onFilterChange: {
    setNameFilter: (value: string) => void;
    setBranchFilter: (value: string) => void;
    setPaymentStatusFilter: (value: string) => void;
  };
  enrollmentType?: EnrollmentType;
}

export function AthletesTab({
  athletes,
  branches,
  currentUserId,
  currentEventId,
  filters,
  onFilterChange,
  enrollmentType
}: AthletesTabProps) {
  const queryClient = useQueryClient();
  const filteredAthletes = athletes?.filter(athlete => {
    const nameMatch = athlete.nome_atleta?.toLowerCase().includes(filters.nameFilter.toLowerCase()) ?? false;
    const branchMatch = filters.branchFilter === "all" || athlete.filial_id === filters.branchFilter;
    const statusMatch = filters.paymentStatusFilter === "all" || athlete.status_pagamento === filters.paymentStatusFilter;
    return nameMatch && branchMatch && statusMatch;
  }).sort((a, b) => {
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    return (a.nome_atleta || '').localeCompare(b.nome_atleta || '', 'pt-BR', { sensitivity: 'base' });
  });

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-4 text-olimpics-text">Gerenciamento de Atletas</h2>
      
      <AthleteFilters
        nameFilter={filters.nameFilter}
        onNameFilterChange={onFilterChange.setNameFilter}
        branchFilter={filters.branchFilter}
        onBranchFilterChange={onFilterChange.setBranchFilter}
        paymentStatusFilter={filters.paymentStatusFilter}
        onPaymentStatusFilterChange={onFilterChange.setPaymentStatusFilter}
        branches={branches}
      />

      <div className="mt-4">
        <PaginatedAthleteList
          athletes={filteredAthletes || []}
          onStatusChange={async (modalityId, status, justification) => {
            try {
              await updateModalityStatus(modalityId, status, justification);
              toast.success("Status atualizado com sucesso!");
              await queryClient.invalidateQueries({ 
                queryKey: ['branch-analytics', currentEventId]
              });
              await queryClient.invalidateQueries({ 
                queryKey: ['athlete-management', currentEventId]
              });
            } catch (error) {
              console.error('Error updating status:', error);
              toast.error("Erro ao atualizar status");
            }
          }}
          onPaymentStatusChange={async (athleteId, status) => {
            try {
              await updatePaymentStatus(athleteId, status);
              toast.success("Status de pagamento atualizado com sucesso!");
              await queryClient.invalidateQueries({ 
                queryKey: ['branch-analytics', currentEventId]
              });
              await queryClient.invalidateQueries({ 
                queryKey: ['athlete-management', currentEventId]
              });
            } catch (error) {
              console.error('Error updating payment status:', error);
              toast.error("Erro ao atualizar status de pagamento");
            }
          }}
          currentUserId={currentUserId}
          eventId={currentEventId}
          enrollmentType={enrollmentType}
        />
      </div>
    </div>
  );
}
