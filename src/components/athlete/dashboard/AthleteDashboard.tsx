
import React, { useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, ClipboardList } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { EventSummaryCard } from "./EventSummaryCard";
import { RegistrationStatusSummary } from "./RegistrationStatusSummary";
import { EnrollmentList } from "@/components/enrollment/EnrollmentList";
import { AvailableModalities } from "@/components/enrollment/AvailableModalities";
import { useEventData } from "@/hooks/useEventData";
import { useAthleteProfileData } from "@/hooks/useAthleteProfileData";
import { useAthleteProfile } from "@/hooks/useAthleteProfile";
import { useRegisteredModalities } from "@/hooks/useRegisteredModalities";
import { useModalityMutations } from "@/hooks/useModalityMutations";
import { useModalitiesWithRepresentatives } from "@/hooks/useModalityRepresentatives";
import { useReadOnlyEvent } from "@/hooks/useReadOnlyEvent";
import { Modality } from "@/types/modality";

export default function AthleteDashboard() {
  const { user, currentEventId } = useAuth();
  const [isEnrollmentsOpen, setIsEnrollmentsOpen] = React.useState(true);
  const [isAvailableOpen, setIsAvailableOpen] = React.useState(true);

  // Fetch event data
  const { data: eventData, isLoading: eventLoading } = useEventData(currentEventId);
  
  // Fetch profile data (for roles and payment)
  const { data: profileData, isLoading: profileLoading } = useAthleteProfileData(user?.id, currentEventId);
  
  // Fetch raw profile data (for filial_id)
  const { data: rawProfile } = useAthleteProfile(user?.id, currentEventId);
  
  // Fetch registered modalities
  const { data: registeredModalities, isLoading: modalitiesLoading } = useRegisteredModalities(user?.id, currentEventId);
  
  // Mutations for register/withdraw
  const { withdrawMutation, registerMutation } = useModalityMutations(user?.id, currentEventId);
  
  // Fetch modalities with representatives using filial_id from raw profile
  const { data: modalitiesWithRepresentatives } = useModalitiesWithRepresentatives(
    rawProfile?.filial_id,
    currentEventId
  );
  
  // Check if event is read-only
  const { data: readOnlyData } = useReadOnlyEvent(user?.id, currentEventId);
  const isReadOnly = !!readOnlyData?.isReadOnly;

  // Fetch all available modalities
  const { data: allModalities, isLoading: allModalitiesLoading } = useQuery({
    queryKey: ['modalities', currentEventId],
    queryFn: async () => {
      if (!currentEventId) return [];
      const { data, error } = await supabase
        .from('modalidades')
        .select('*')
        .eq('evento_id', currentEventId)
        .eq('status', 'Ativa');

      if (error) throw error;
      return data as Modality[];
    },
    enabled: !!currentEventId,
  });

  // SEO
  useEffect(() => {
    document.title = 'Dashboard do Atleta | EECC';
    
    const metaDesc = (document.querySelector('meta[name="description"]') as HTMLMetaElement) || (() => {
      const m = document.createElement('meta');
      m.name = 'description';
      document.head.appendChild(m);
      return m;
    })();
    metaDesc.content = 'Dashboard do atleta: veja suas inscrições, modalidades disponíveis e status do evento.';
  }, []);

  const isLoading = eventLoading || profileLoading || modalitiesLoading || allModalitiesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  // Group modalities by group
  const groupedModalities = allModalities?.reduce((groups: Record<string, Modality[]>, modality) => {
    const grupo = modality.grupo || 'Outras Modalidades';
    if (!groups[grupo]) {
      groups[grupo] = [];
    }
    groups[grupo].push(modality);
    return groups;
  }, {}) || {};

  // Check if user is "Público Geral"
  const isPublicUser = profileData?.papeis?.some(papel => papel.codigo === 'PGR');

  return (
    <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Read-only alert */}
      {isReadOnly && (
        <Alert className="bg-warning/10 border-warning text-warning-foreground">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Este evento está encerrado ou suspenso. As ações de inscrição e cancelamento estão desabilitadas.
          </AlertDescription>
        </Alert>
      )}

      {/* Event Summary */}
      {eventData && (
        <EventSummaryCard event={eventData} />
      )}

      {/* Registration Status Summary */}
      <RegistrationStatusSummary 
        registeredModalities={registeredModalities || []}
        paymentStatus={profileData?.pagamento_status}
        paymentAmount={profileData?.pagamento_valor}
      />

      {/* My Enrollments Section */}
      {!isPublicUser && (
        <Collapsible
          open={isEnrollmentsOpen}
          onOpenChange={setIsEnrollmentsOpen}
          className="w-full"
        >
          <Card className="border-olimpics-green-primary/20">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="bg-olimpics-green-primary/5 hover:bg-olimpics-green-primary/10 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-olimpics-green-primary" />
                    <CardTitle className="text-lg font-semibold text-olimpics-green-primary">
                      Minhas Inscrições
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {registeredModalities?.length || 0} {(registeredModalities?.length || 0) === 1 ? 'modalidade' : 'modalidades'}
                    </span>
                    {isEnrollmentsOpen ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-4 sm:p-6">
                <EnrollmentList
                  registeredModalities={registeredModalities || []}
                  withdrawMutation={withdrawMutation}
                  modalitiesWithRepresentatives={modalitiesWithRepresentatives || []}
                  readOnly={isReadOnly}
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Available Modalities Section */}
      {!isPublicUser && (
        <Collapsible
          open={isAvailableOpen}
          onOpenChange={setIsAvailableOpen}
          className="w-full"
        >
          <Card className="border-olimpics-green-primary/20">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="bg-olimpics-green-primary/5 hover:bg-olimpics-green-primary/10 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-olimpics-green-primary">
                    Modalidades Disponíveis
                  </CardTitle>
                  {isAvailableOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-4 sm:p-6">
                <AvailableModalities
                  groupedModalities={groupedModalities}
                  registeredModalities={registeredModalities || []}
                  registerMutation={registerMutation}
                  userGender={profileData?.genero?.toLowerCase() || ''}
                  readOnly={isReadOnly}
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Message for public users */}
      {isPublicUser && (
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
