
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { supabase } from "@/lib/supabase";
import { EnrollmentList } from "./enrollment/EnrollmentList";
import { AvailableModalities } from "./enrollment/AvailableModalities";
import { EnrollmentHeader } from "./enrollment/EnrollmentHeader";
import { useAthleteProfile } from "@/hooks/useAthleteProfile";
import { useRegisteredModalities } from "@/hooks/useRegisteredModalities";
import { useModalityMutations } from "@/hooks/useModalityMutations";
import { useModalitiesWithRepresentatives } from "@/hooks/useModalityRepresentatives";
import { Modality } from "@/types/modality";

export default function AthleteRegistrations() {
  const { user } = useAuth();
  const [isEnrollmentsOpen, setIsEnrollmentsOpen] = React.useState(true);
  const currentEventId = localStorage.getItem('currentEventId');

  const { data: athleteProfile, isLoading: profileLoading } = useAthleteProfile(user?.id, currentEventId);
  const { data: registeredModalities, isLoading: registrationsLoading } = useRegisteredModalities(user?.id, currentEventId);
  const { withdrawMutation, registerMutation } = useModalityMutations(user?.id, currentEventId);

  // Fetch modalities with representatives data
  const { data: modalitiesWithRepresentatives, isLoading: representativesLoading } = useModalitiesWithRepresentatives(
    athleteProfile?.filial_id,
    currentEventId
  );

  const { data: allModalities, isLoading: modalitiesLoading } = useQuery({
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

  if (modalitiesLoading || registrationsLoading || profileLoading || representativesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  const groupedModalities = allModalities?.reduce((groups: Record<string, Modality[]>, modality) => {
    const grupo = modality.grupo || 'Outras Modalidades';
    if (!groups[grupo]) {
      groups[grupo] = [];
    }
    groups[grupo].push(modality);
    return groups;
  }, {});

  return (
    <div className="container mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-2 sm:px-4 max-w-7xl">
      <Alert className="bg-olimpics-green-primary/10 border-olimpics-green-primary text-olimpics-text shadow-sm transition-all duration-200 hover:bg-olimpics-green-primary/15">
        <Info className="h-4 w-4 sm:h-5 sm:w-5 text-olimpics-green-primary flex-shrink-0 mt-0.5" />
        <AlertDescription className="text-xs sm:text-sm leading-relaxed">
          As inscrições nas modalidades devem ser realizadas nesta página! Após a confirmação da inscrição em uma modalidade pelo Representante de Delegação, o atleta não poderá cancelar sua participação nesta modalidade diretamente pelo sistema. Caso seja necessário cancelar uma inscrição já aprovada, o atleta deverá entrar em contato com o seu respectivo Representante de Delegação para solicitar qualquer alteração.
        </AlertDescription>
      </Alert>
      
      <Collapsible
        open={isEnrollmentsOpen}
        onOpenChange={setIsEnrollmentsOpen}
        className="w-full space-y-2 sm:space-y-4"
      >
        <div className="relative overflow-hidden rounded-lg bg-[#FEF7CD] p-1 animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-olimpics-green-primary/5 to-olimpics-green-secondary/5" />
          <Card className="transition-all duration-300 hover:shadow-xl border-2 border-olimpics-green-primary/20 bg-white/95 backdrop-blur">
            <EnrollmentHeader 
              isOpen={isEnrollmentsOpen}
              registeredModalitiesCount={registeredModalities?.length || 0}
            />
            <CollapsibleContent className="transition-all duration-300">
              <CardContent className="p-3 sm:p-6">
                <div className="mb-4 sm:mb-6 text-center">
                  <h3 className="text-base sm:text-lg font-semibold text-olimpics-green-primary mb-2">
                    Inscreva-se Agora nas Modalidades Olímpicas!
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Escolha suas modalidades e faça parte desta celebração do esporte e filosofia
                  </p>
                </div>

                <EnrollmentList
                  registeredModalities={registeredModalities || []}
                  withdrawMutation={withdrawMutation}
                  modalitiesWithRepresentatives={modalitiesWithRepresentatives || []}
                />

                <AvailableModalities
                  groupedModalities={groupedModalities || {}}
                  registeredModalities={registeredModalities || []}
                  registerMutation={registerMutation}
                  userGender={athleteProfile?.genero?.toLowerCase() || ''}
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </div>
      </Collapsible>
    </div>
  );
}
