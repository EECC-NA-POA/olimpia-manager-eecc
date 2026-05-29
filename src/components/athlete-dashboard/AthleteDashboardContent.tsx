import React from 'react';
import { Link } from 'react-router-dom';
import { useEventData } from '@/hooks/useEventData';
import { useRegisteredModalities } from '@/hooks/useRegisteredModalities';
import { useAthletePaymentStatus } from './hooks/useAthletePaymentStatus';
import { useAvailableModalitiesForAthlete } from './hooks/useAvailableModalitiesForAthlete';
import { useModalitiesWithRepresentatives } from '@/hooks/useModalityRepresentatives';
import { useAthleteProfile } from '@/hooks/useAthleteProfile';
import { useModalitySchedules } from './hooks/useModalitySchedules';
import { EventInfoCard } from './components/EventInfoCard';
import { MyEnrollmentsCard } from './components/MyEnrollmentsCard';
import { AvailableModalitiesCard } from './components/AvailableModalitiesCard';
import { QuickSummaryCard } from './components/QuickSummaryCard';
import { PaymentUploadCard } from './components/PaymentUploadCard';
import { Calendar, Bell, FileText, AlertTriangle, User } from 'lucide-react';
import { LoadingImage } from '@/components/ui/loading-image';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  
  // Fetch modality schedules
  const { data: modalitySchedules } = useModalitySchedules(eventId);

  const isLoading = eventLoading || modalitiesLoading || paymentLoading || availableLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingImage />
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
  const hasNoEnrollments = totalEnrolled === 0 && !isPublicUser;

  // Get initials from user name for avatar
  const getInitials = (): string | null => {
    const name = (athleteProfile as any)?.nome_completo || '';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return null;
    return parts.slice(0, 2).map((n: string) => n[0].toUpperCase()).join('');
  };

  const initials = getInitials();

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="rounded-xl border bg-card p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4">
        {/* Avatar with initials */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-olimpics-green-primary flex items-center justify-center border-4 border-olimpics-green-primary/20">
            {initials
              ? <span className="text-xl sm:text-2xl font-bold text-white">{initials}</span>
              : <User className="h-8 w-8 text-white" />
            }
          </div>
          {!isPublicUser && athleteIdentifier && (
            <span className="rounded-full bg-olimpics-green-primary/10 border border-olimpics-green-primary/30 px-3 py-0.5 text-xs font-semibold text-olimpics-green-primary">
              #{athleteIdentifier}
            </span>
          )}
          {isPublicUser && (
            <span className="rounded-full bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">
              Público
            </span>
          )}
        </div>

        {/* Info + Quick Links */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          {(athleteProfile as any)?.nome_completo && (
            <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight truncate">
              {(athleteProfile as any).nome_completo}
            </h1>
          )}
          {eventData && (
            <p className="text-sm text-muted-foreground mt-0.5 truncate">{eventData.nome}</p>
          )}
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
            <Button asChild size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
              <Link to="/cronograma">
                <Calendar className="h-3.5 w-3.5" />
                Cronograma
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
              <Link to="/notifications">
                <Bell className="h-3.5 w-3.5" />
                Notificações
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
              <Link to="/regulamento">
                <FileText className="h-3.5 w-3.5" />
                Regulamento
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Alert for athletes with no enrollments */}
      {hasNoEnrollments && (
        <Alert className="border-olimpics-orange-primary bg-olimpics-orange-primary/10">
          <AlertTriangle className="h-5 w-5 text-olimpics-orange-primary" />
          <AlertTitle className="text-olimpics-orange-primary font-semibold">
            Você ainda não está inscrito em nenhuma modalidade!
          </AlertTitle>
          <AlertDescription className="text-foreground">
            Para participar do evento, inscreva-se em pelo menos uma modalidade na seção "Modalidades Disponíveis" abaixo.
          </AlertDescription>
        </Alert>
      )}

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
        modalitySchedules={modalitySchedules || []}
      />

      {/* Available Modalities */}
      <AvailableModalitiesCard
        modalities={availableModalities || []}
        userId={userId}
        eventId={eventId}
        registeredModalityIds={registeredModalities?.map(m => m.modalidade.id) || []}
        modalitySchedules={modalitySchedules || []}
      />
    </div>
  );
}
