import React from 'react';
import { useEventData } from '@/hooks/useEventData';
import { useRegisteredModalities } from '@/hooks/useRegisteredModalities';
import { useAthletePaymentStatus } from './hooks/useAthletePaymentStatus';
import { useAvailableModalitiesForAthlete } from './hooks/useAvailableModalitiesForAthlete';
import { useModalitiesWithRepresentatives } from '@/hooks/useModalityRepresentatives';
import { useAthleteProfile } from '@/hooks/useAthleteProfile';
import { EventInfoCard } from './components/EventInfoCard';
import { MyEnrollmentsCard } from './components/MyEnrollmentsCard';
import { AvailableModalitiesCard } from './components/AvailableModalitiesCard';
import { QuickSummaryCard } from './components/QuickSummaryCard';
import { PaymentUploadCard } from './components/PaymentUploadCard';
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
  const { data: athleteProfile, isLoading: profileLoading } = useAthleteProfile(userId, eventId);
  
  // Fetch representatives data
  const { data: modalitiesWithRepresentatives, isLoading: representativesLoading } = useModalitiesWithRepresentatives(
    athleteProfile?.filial_id,
    eventId
  );

  const isLoading = eventLoading || modalitiesLoading || paymentLoading || availableLoading || profileLoading;

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

  // Check if payment is pending and needs upload
  const needsPaymentUpload = paymentStatus && 
    paymentStatus.status_pagamento === 'pendente' && 
    !paymentStatus.isento &&
    paymentStatus.valor_taxa && 
    paymentStatus.valor_taxa > 0;

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-5xl">
      {/* Page Header - Mobile optimized */}
      <div className="mb-1">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Meu Dashboard</h1>
        <p className="text-sm text-muted-foreground">Acompanhe suas inscrições e informações do evento</p>
      </div>

      {/* Quick Summary */}
      <QuickSummaryCard
        totalEnrolled={totalEnrolled}
        pendingPayment={pendingPayment}
        paymentStatus={paymentStatus}
      />

      {/* Payment Upload - Show if payment is pending */}
      {needsPaymentUpload && (
        <PaymentUploadCard
          userId={userId}
          eventId={eventId}
          paymentStatus={paymentStatus}
          taxaInscricaoId={paymentStatus.taxa_inscricao_id || undefined}
        />
      )}

      {/* Event Info */}
      {eventData && <EventInfoCard event={eventData} />}

      {/* My Enrollments */}
      <MyEnrollmentsCard
        enrollments={registeredModalities || []}
        userId={userId}
        eventId={eventId}
        modalitiesWithRepresentatives={modalitiesWithRepresentatives || []}
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
