import React from 'react';
import { Link } from 'react-router-dom';
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
import { Loader2, Calendar, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  // Get athlete profile info for display
  const athleteGender = athleteProfile?.genero || '';
  const athleteIdentifier = athleteProfile?.numero_identificador || '';
  const isPublicUser = athleteProfile?.papeis?.some(p => p.codigo === 'PGR') || false;

  const getProfileImage = (gender: string | undefined) => {
    switch (gender?.toLowerCase()) {
      case 'masculino':
        return "/lovable-uploads/EECC_marca_portugues_cores_RGB.png";
      case 'feminino':
        return "/lovable-uploads/EECC_marca_portugues_cores_RGB.png";
      default:
        return "/lovable-uploads/EECC_marca_portugues_cores_RGB.png";
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-5xl">
      {/* Page Header with Photo and ID */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* Athlete Photo and ID */}
        <div className="flex flex-col items-center space-y-2">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32">
            <img
              src={getProfileImage(athleteGender)}
              alt="Foto do perfil do usuário"
              className="w-full h-full rounded-full object-cover border-4 border-olimpics-green-primary"
            />
          </div>
          <div className="bg-olimpics-green-primary text-white px-3 py-1.5 rounded-lg shadow-lg text-center">
            <p className="text-xs font-medium">
              {isPublicUser ? 'PERFIL' : 'ID DO ATLETA'}
            </p>
            <p className="text-lg font-bold">
              {isPublicUser ? 'Público Geral' : (athleteIdentifier || 'N/A')}
            </p>
          </div>
        </div>

        {/* Header Text and Quick Links */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mb-3">Acompanhe suas inscrições e informações do evento</p>
          
          {/* Quick Navigation Links */}
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/cronograma">
                <Calendar className="h-4 w-4" />
                Cronograma
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/notifications">
                <Bell className="h-4 w-4" />
                Notificações
              </Link>
            </Button>
          </div>
        </div>
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
