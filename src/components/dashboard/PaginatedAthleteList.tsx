
import { AthleteRegistrationCard } from "@/components/AthleteRegistrationCard";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AthleteManagement } from "@/lib/api";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useReadOnlyEvent } from "@/hooks/useReadOnlyEvent";
import { EnrollmentType } from "@/hooks/useEnrollAthleteInModality";

interface PaginatedAthleteListProps {
  athletes: AthleteManagement[];
  onStatusChange: (modalityId: string, status: string, justification: string) => Promise<void>;
  onPaymentStatusChange?: (athleteId: string, status: string) => Promise<void>;
  currentUserId?: string;
  itemsPerPage?: number;
  delegationOnly?: boolean;
  eventId?: string;
  enrollmentType?: EnrollmentType;
}

export function PaginatedAthleteList({
  athletes,
  onStatusChange,
  onPaymentStatusChange,
  currentUserId,
  itemsPerPage = 6,
  delegationOnly = false,
  eventId,
  enrollmentType
}: PaginatedAthleteListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const { user, currentEventId } = useAuth();
  const { data: readOnlyData } = useReadOnlyEvent(user?.id, currentEventId);
  const isReadOnly = !!readOnlyData?.isReadOnly;

  const effectiveEventId = eventId || currentEventId;

  useEffect(() => {
    setCurrentPage(1);
  }, [athletes.length]);

  const filteredAthletes = useMemo(() => {
    if (!delegationOnly || !user?.filial_id) {
      return athletes;
    }
    
    // Log for debugging
    console.log('Filtering athletes for delegation view', {
      userBranchId: user.filial_id,
      totalAthletes: athletes.length,
      athleteBranches: athletes.map(a => a.filial_id)
    });
    
    return athletes.filter(athlete => athlete.filial_id === user.filial_id);
  }, [athletes, delegationOnly, user?.filial_id]);

  const totalPages = Math.ceil(filteredAthletes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAthletes = filteredAthletes.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pageNumbers.push(1);

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 2) {
      end = Math.min(4, totalPages - 1);
    }
    if (currentPage >= totalPages - 1) {
      start = Math.max(2, totalPages - 3);
    }

    if (start > 2) pageNumbers.push(-1);
    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }
    if (end < totalPages - 1) pageNumbers.push(-1);

    if (totalPages > 1) pageNumbers.push(totalPages);

    return pageNumbers;
  };

  if (filteredAthletes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {delegationOnly 
          ? "Nenhum atleta encontrado na sua delegação com os filtros selecionados."
          : "Nenhum atleta encontrado com os filtros selecionados."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentAthletes.map((athlete) => (
          <AthleteRegistrationCard
            key={athlete.id}
            registration={athlete}
            onStatusChange={onStatusChange}
            onPaymentStatusChange={onPaymentStatusChange}
            isCurrentUser={currentUserId === athlete.id}
            readOnly={isReadOnly}
            eventId={effectiveEventId || undefined}
            enrollmentType={enrollmentType}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  aria-disabled={currentPage === 1}
                />
              </PaginationItem>

              {getPageNumbers().map((pageNum, idx) => (
                pageNum === -1 ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      isActive={pageNum === currentPage}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  aria-disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground">
        Mostrando {filteredAthletes.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredAthletes.length)} de {filteredAthletes.length} atletas
      </div>
    </div>
  );
}
