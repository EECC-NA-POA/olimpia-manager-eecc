import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useEventData } from "@/hooks/useEventData";
import { useAthleteProfileData } from "@/hooks/useAthleteProfileData";
import { useAthleteProfile } from "@/hooks/useAthleteProfile";
import { useRegisteredModalities } from "@/hooks/useRegisteredModalities";
import { useModalityMutations } from "@/hooks/useModalityMutations";
import { useReadOnlyEvent } from "@/hooks/useReadOnlyEvent";
import { EventSummaryCard } from "./EventSummaryCard";
import { RegistrationStatusSummary } from "./RegistrationStatusSummary";
import { MyEnrollmentsList } from "./MyEnrollmentsList";
import { AvailableModalitiesForAthlete } from "./AvailableModalitiesForAthlete";
import { Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

export default function AthleteDashboard() {
  const { user, currentEventId } = useAuth();
  const [isEnrollmentsOpen, setIsEnrollmentsOpen] = useState(true);
  const [isAvailableOpen, setIsAvailableOpen] = useState(true);

  // Fetch event data
  const { data: eventData, isLoading: eventLoading } = useEventData(currentEventId);

  // Fetch profile data (for roles and payment) - ONLY for current user
  const { data: profileData, isLoading: profileLoading } = useAthleteProfileData(user?.id, currentEventId);

  // Fetch raw profile data
  const { data: rawProfile } = useAthleteProfile(user?.id, currentEventId);

  // Fetch registered modalities - ONLY for current user
  const { data: registeredModalities, isLoading: modalitiesLoading } = useRegisteredModalities(user?.id, currentEventId);

  // Mutations for register/withdraw - ONLY for current user
  const { withdrawMutation, registerMutation } = useModalityMutations(user?.id, currentEventId);

  // Check if event is read-only
  const { data: readOnlyData } = useReadOnlyEvent(user?.id, currentEventId);
  const isReadOnly = !!readOnlyData?.isReadOnly;

  // Fetch all available modalities for this event (public data - no user info)
  const { data: allModalities = [], isLoading: allModalitiesLoading } = useQuery({
    queryKey: ['event-modalities-public', currentEventId],
    queryFn: async () => {
      if (!currentEventId) return [];

      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, tipo_modalidade, categoria, descricao, grupo')
        .eq('evento_id', currentEventId)
        .eq('status', 'Ativa')
        .order('grupo', { ascending: true })
        .order('nome', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentEventId
  });

  // SEO
  useEffect(() => {
    const eventName = eventData?.nome || 'Evento';
    document.title = `Dashboard - ${eventName}`;

    const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (metaDesc) {
      metaDesc.content = `Acompanhe suas inscrições no evento ${eventName}`;
    }
  }, [eventData]);

  // Check if user is "Público Geral" (cannot register for modalities)
  const isPublicUser = profileData?.papeis?.some(
    (papel: { codigo: string }) => papel.codigo === 'PGR'
  );

  const isLoading = eventLoading || profileLoading || modalitiesLoading || allModalitiesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Nenhum evento selecionado. Por favor, selecione um evento no menu.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Get registered modality IDs for filtering available modalities
  const registeredModalityIds = (registeredModalities || []).map(m => m.modalidade.id);

  // Transform registered modalities for the list component
  const enrollmentsForList = (registeredModalities || []).map(m => ({
    inscricao_id: String(m.id),
    modalidade_id: m.modalidade.id,
    modalidade_nome: m.modalidade.nome,
    tipo: m.modalidade.tipo_modalidade || 'individual',
    categoria: m.modalidade.categoria || '',
    status: m.status || 'pendente',
    data_inscricao: m.data_inscricao || new Date().toISOString(),
    grupo: ''
  }));

  // Transform modalities for available list
  const modalitiesForList = allModalities.map(m => ({
    id: m.id,
    nome: m.nome,
    tipo: m.tipo_modalidade || 'individual',
    categoria: m.categoria || '',
    descricao: m.descricao || '',
    grupo: m.grupo || ''
  }));

  const handleRegister = (modalityId: string) => {
    registerMutation.mutate(Number(modalityId));
  };

  const handleWithdraw = (inscricaoId: string) => {
    withdrawMutation.mutate(Number(inscricaoId));
  };

  return (
    <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Read-only alert */}
      {isReadOnly && (
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Este evento está encerrado ou suspenso. As ações de inscrição e cancelamento estão desabilitadas.
          </AlertDescription>
        </Alert>
      )}

      {/* Event Summary - Public info only */}
      <EventSummaryCard event={eventData} />

      {/* Registration Status Summary - Only current user's data */}
      <RegistrationStatusSummary
        registeredModalities={registeredModalities || []}
        paymentStatus={profileData?.pagamento_status}
        paymentAmount={profileData?.pagamento_valor}
      />

      {!isPublicUser ? (
        <>
          {/* My Enrollments - Only current user's enrollments, NO representative data */}
          <MyEnrollmentsList
            enrollments={enrollmentsForList}
            isOpen={isEnrollmentsOpen}
            onOpenChange={setIsEnrollmentsOpen}
            onWithdraw={handleWithdraw}
            isWithdrawing={withdrawMutation.isPending}
            isReadOnly={isReadOnly}
          />

          {/* Available Modalities - Public modality data only, NO other users' data */}
          <AvailableModalitiesForAthlete
            modalities={modalitiesForList}
            registeredModalityIds={registeredModalityIds}
            isOpen={isAvailableOpen}
            onOpenChange={setIsAvailableOpen}
            onRegister={handleRegister}
            isRegistering={registerMutation.isPending}
            isReadOnly={isReadOnly}
          />
        </>
      ) : (
        <Card className="border-muted">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Como usuário de Público Geral, você não pode se inscrever em modalidades esportivas.
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
