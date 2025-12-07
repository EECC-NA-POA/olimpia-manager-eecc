import React from 'react';
import { useEventData } from '@/hooks/useEventData';
import { useRegisteredModalities } from '@/hooks/useRegisteredModalities';
import { useAthletePaymentStatus } from './hooks/useAthletePaymentStatus';
import { useAvailableModalitiesForAthlete } from './hooks/useAvailableModalitiesForAthlete';
import { EventInfoCard } from './components/EventInfoCard';
import { MyEnrollmentsCard } from './components/MyEnrollmentsCard';
import { AvailableModalitiesCard } from './components/AvailableModalitiesCard';
import { QuickSummaryCard } from './components/QuickSummaryCard';
import { Loader2 } from 'lucide-react';

interface AthleteDashboardContentProps {
  userId: string;
  eventId: string;
}

export function AthleteDashboardContent({ userId, eventId }: AthleteDashboardContentProps) {
  const { data: eventData, isLoading: eventLoading } = useEventData(eventId);
  const { data: registeredModalities, isLoading: modalitiesLoading } = useRegisteredModalities(userId, eventId);
  const { data: paymentStatus, isLoading: paymentLoading } = useAthletePaymentStatus(userId, eventId);
  const { data: availableModalities, isLoading: availableLoading } = useAvailableModalitiesForAthlete(userId, eventId);

  const isLoading = eventLoading || modalitiesLoading || paymentLoading || availableLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate summary data
  const totalEnrolled = registeredModalities?.length || 0;
  const pendingPayment = registeredModalities?.filter(m => m.status === 'pendente').length || 0;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-foreground">Meu Dashboard</h1>
        <p className="text-muted-foreground">Acompanhe suas inscrições e informações do evento</p>
      </div>

      {/* Quick Summary */}
      <QuickSummaryCard
        totalEnrolled={totalEnrolled}
        pendingPayment={pendingPayment}
        paymentStatus={paymentStatus}
      />

      {/* Event Info */}
      {eventData && <EventInfoCard event={eventData} />}

      {/* My Enrollments */}
      <MyEnrollmentsCard
        enrollments={registeredModalities || []}
        userId={userId}
        eventId={eventId}
      />

      {/* Available Modalities */}
      <AvailableModalitiesCard
        modalities={availableModalities || []}
        userId={userId}
        eventId={eventId}
        registeredModalityIds={registeredModalities?.map(m => m.modalidade.id) || []}
      />
    </div>
  );
}
