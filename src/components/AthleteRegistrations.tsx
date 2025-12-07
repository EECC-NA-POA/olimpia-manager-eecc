import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, Loader2, Phone, Users, User } from "lucide-react";
import { useAthleteProfile } from "@/hooks/useAthleteProfile";
import { useRegisteredModalities } from "@/hooks/useRegisteredModalities";
import { useModalitiesWithRepresentatives } from "@/hooks/useModalityRepresentatives";
import { useReadOnlyEvent } from "@/hooks/useReadOnlyEvent";

const formatPhoneForWhatsApp = (phone: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 11 && !cleanPhone.startsWith('55')) {
    return `55${cleanPhone}`;
  }
  if (cleanPhone.length === 10 && !cleanPhone.startsWith('55')) {
    return `55${cleanPhone}`;
  }
  return cleanPhone;
};

export default function AthleteRegistrations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentEventId = localStorage.getItem('currentEventId');
  
  useEffect(() => {
    const isPublicUser = user?.papeis?.some(papel => papel.codigo === 'PGR');
    if (isPublicUser) {
      navigate('/athlete-profile', { replace: true });
    }
  }, [user, navigate]);

  const { data: readOnlyData } = useReadOnlyEvent(user?.id, currentEventId);
  const isReadOnly = !!readOnlyData?.isReadOnly;

  const { data: athleteProfile, isLoading: profileLoading } = useAthleteProfile(user?.id, currentEventId);
  const { data: registeredModalities, isLoading: registrationsLoading } = useRegisteredModalities(user?.id, currentEventId);
  
  const { data: modalitiesWithRepresentatives, isLoading: representativesLoading } = useModalitiesWithRepresentatives(
    athleteProfile?.filial_id,
    currentEventId
  );

  const isLoading = profileLoading || registrationsLoading || representativesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getRepresentativesForModality = (modalityId: number) => {
    const modality = modalitiesWithRepresentatives?.find(m => m.id === modalityId);
    return modality?.representatives || [];
  };

  // Group modalities by their representatives
  const modalitiesWithReps = registeredModalities?.map(reg => ({
    ...reg,
    representatives: getRepresentativesForModality(reg.modalidade?.id)
  })) || [];

  return (
    <div className="min-h-screen pb-20 md:pb-6">
      <div className="container mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-3 sm:px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Representantes das Modalidades</h1>
          <p className="text-sm text-muted-foreground">
            Contate os representantes das modalidades em que você está inscrito
          </p>
        </div>

        {isReadOnly && (
          <Alert className="bg-warning/10 border-warning text-warning-foreground">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Este evento está encerrado ou suspenso.
            </AlertDescription>
          </Alert>
        )}

        {modalitiesWithReps.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Você não está inscrito em nenhuma modalidade.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Acesse o Dashboard para se inscrever nas modalidades disponíveis.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {modalitiesWithReps.map((item) => (
              <Card key={item.id} className="border-border/50 shadow-sm overflow-hidden">
                {/* Modality Header */}
                <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
                        {item.modalidade?.nome}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="capitalize">{item.modalidade?.tipo_modalidade}</span>
                        {item.modalidade?.categoria && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{item.modalidade?.categoria}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={item.status === 'confirmada' || item.status === 'confirmado' ? 'default' : 'secondary'}
                      className={`shrink-0 text-xs ${
                        item.status === 'confirmada' || item.status === 'confirmado' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {item.status === 'confirmada' || item.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                    </Badge>
                  </div>
                </CardHeader>

                {/* Representatives */}
                <CardContent className="p-4">
                  {item.representatives.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Users className="h-4 w-4 text-primary" />
                        <span>Representantes</span>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {item.representatives.map((rep: any, index: number) => (
                          <div 
                            key={index} 
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/50"
                          >
                            <div className="p-2 rounded-full bg-primary/10 shrink-0">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground text-sm truncate">
                                {rep.nome_completo}
                              </p>
                              {rep.telefone && (
                                <a
                                  href={`https://wa.me/${formatPhoneForWhatsApp(rep.telefone)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 text-xs mt-0.5 transition-colors"
                                >
                                  <Phone className="h-3 w-3" />
                                  <span>{rep.telefone}</span>
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/20 text-center">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Nenhum representante definido para esta modalidade.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
