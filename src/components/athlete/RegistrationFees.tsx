
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { useRegistrationFees } from './registration-fees/useRegistrationFees';
import { RegistrationFeeCard } from './registration-fees/RegistrationFeeCard';
import type { RegistrationFeesProps } from './registration-fees/types';

export default function RegistrationFees({ eventId, userProfileId }: RegistrationFeesProps) {
  console.log('RegistrationFees component mounted with:', { eventId, userProfileId });
  
  const [isOpen, setIsOpen] = useState(true);
  const { data: fees, isLoading } = useRegistrationFees(eventId);

  console.log('Current fees data:', fees);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-orange-primary" />
      </div>
    );
  }

  if (!fees || fees.length === 0) {
    console.log('No fees data available');
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-olimpics-orange-primary" />
            Taxas de Inscrição
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Nenhuma taxa de inscrição disponível.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter fees to only show those with show_card = true
  const visibleFees = fees.filter(fee => fee.mostra_card);

  // Separate regular and exempt fees
  const regularFees = visibleFees.filter(fee => !fee.isento);
  const exemptFees = visibleFees.filter(fee => fee.isento);

  // Sort regular fees to put main profile types first
  const sortedRegularFees = [...regularFees].sort((a, b) => {
    // First, prioritize user's profile if it exists
    if (a.perfil?.id === userProfileId) return -1;
    if (b.perfil?.id === userProfileId) return 1;

    // Then prioritize main profile types ("Atleta" or "Público Geral")
    const isMainProfileA = a.perfil?.nome?.includes('Atleta') || a.perfil?.nome?.includes('Público Geral');
    const isMainProfileB = b.perfil?.nome?.includes('Atleta') || b.perfil?.nome?.includes('Público Geral');
    
    if (isMainProfileA && !isMainProfileB) return -1;
    if (!isMainProfileA && isMainProfileB) return 1;
    
    return 0;
  });

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-olimpics-orange-primary" />
            Taxas de Inscrição
          </CardTitle>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="space-y-6">
              {/* Regular fees */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedRegularFees.map((fee) => (
                  <RegistrationFeeCard
                    key={fee.id}
                    fee={fee}
                    isUserFee={fee.perfil?.id === userProfileId}
                  />
                ))}
              </div>

              {/* Show separator and exempt fees only if there are any */}
              {exemptFees.length > 0 && (
                <>
                  <Separator className="my-6" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exemptFees.map((fee) => (
                      <RegistrationFeeCard
                        key={fee.id}
                        fee={fee}
                        isUserFee={fee.perfil?.id === userProfileId}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
