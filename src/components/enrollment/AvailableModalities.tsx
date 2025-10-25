
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { UseMutationResult } from "@tanstack/react-query";
import { Modality, RegisteredModality } from "@/types/modality";

interface AvailableModalitiesProps {
  groupedModalities: Record<string, Modality[]>;
  registeredModalities: RegisteredModality[];
  registerMutation: UseMutationResult<void, Error, number, unknown>;
  userGender: string;
  readOnly?: boolean;
}

export const AvailableModalities = ({
  groupedModalities,
  registeredModalities,
  registerMutation,
  userGender,
  readOnly = false
}: AvailableModalitiesProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const isModalityRegistered = (modalityId: number) => {
    return registeredModalities.some(reg => reg.modalidade?.id === modalityId);
  };

  const canRegisterForModality = (modality: Modality) => {
    if (isModalityRegistered(modality.id)) return false;
    
    // Check gender restrictions
    if (modality.categoria && modality.categoria.toLowerCase() !== 'mista') {
      const modalityGender = modality.categoria.toLowerCase();
      if (modalityGender === 'masculino' && userGender !== 'masculino') return false;
      if (modalityGender === 'feminino' && userGender !== 'feminino') return false;
    }
    
    return true;
  };

  const getModalityTypeLabel = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case 'individual': return 'Individual';
      case 'equipe': return 'Equipe';
      case 'dupla': return 'Dupla';
      default: return tipo || 'Individual';
    }
  };

  const getCategoryBadgeVariant = (categoria: string) => {
    switch (categoria?.toLowerCase()) {
      case 'masculino': return 'default';
      case 'feminino': return 'secondary';
      case 'mista': return 'outline';
      default: return 'outline';
    }
  };

  if (!groupedModalities || Object.keys(groupedModalities).length === 0) {
    return (
      <div className="text-center py-4 sm:py-6 lg:py-8 text-muted-foreground">
        <p className="text-sm sm:text-base">Nenhuma modalidade disponível para inscrição.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-semibold text-olimpics-green-primary">
        Modalidades Disponíveis
      </h3>
      
      <div className="space-y-2 sm:space-y-3">
        {Object.entries(groupedModalities).map(([group, modalities]) => (
          <Card key={group} className="overflow-hidden">
            <Collapsible 
              open={expandedGroups[group]} 
              onOpenChange={() => toggleGroup(group)}
            >
              <CollapsibleTrigger className="w-full">
                <CardHeader className="bg-olimpics-green-primary/5 hover:bg-olimpics-green-primary/10 transition-colors py-3 sm:py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm sm:text-base font-medium text-left">
                      {group}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {modalities.length} modalidades
                      </Badge>
                      {expandedGroups[group] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="p-2 sm:p-4">
                  {/* Mobile Layout */}
                  <div className="block sm:hidden space-y-3">
                    {modalities.map((modality) => {
                      const canRegister = canRegisterForModality(modality);
                      const isRegistered = isModalityRegistered(modality.id);
                      
                      return (
                        <div 
                          key={modality.id} 
                          className={`border rounded-lg p-3 ${
                            isRegistered ? 'bg-success-background border-success/20' : 'bg-card border-border'
                          }`}
                        >
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm text-foreground">{modality.nome}</h4>
                            
                            <div className="flex flex-wrap gap-1">
                              <Badge 
                                variant={getCategoryBadgeVariant(modality.categoria)} 
                                className="text-xs"
                              >
                                {modality.categoria}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {getModalityTypeLabel(modality.tipo_modalidade)}
                              </Badge>
                            </div>
                            
                            {modality.descricao && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {modality.descricao}
                              </p>
                            )}
                            
                            <Button
                              size="sm"
                              disabled={readOnly || !canRegister || registerMutation.isPending}
                              onClick={() => registerMutation.mutate(modality.id)}
                              className={`w-full text-xs ${
                                isRegistered 
                                  ? 'bg-green-600 hover:bg-green-700' 
                                  : 'bg-olimpics-green-primary hover:bg-olimpics-green-secondary'
                              }`}
                            >
                              {registerMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                  Processando...
                                </>
                              ) : isRegistered ? (
                                'Inscrito'
                              ) : (
                                <>
                                  <Plus className="mr-1 h-3 w-3" />
                                  {readOnly ? 'Indisponível' : 'Inscrever-se'}
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:block overflow-x-auto">
                    <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
                      {modalities.map((modality) => {
                        const canRegister = canRegisterForModality(modality);
                        const isRegistered = isModalityRegistered(modality.id);
                        
                        return (
                          <div 
                            key={modality.id} 
                            className={`border rounded-lg p-4 ${
                              isRegistered ? 'bg-success-background border-success/20' : 'bg-card border-border'
                            }`}
                          >
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium text-base text-foreground">{modality.nome}</h4>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <Badge 
                                    variant={getCategoryBadgeVariant(modality.categoria)} 
                                    className="text-xs"
                                  >
                                    {modality.categoria}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {getModalityTypeLabel(modality.tipo_modalidade)}
                                  </Badge>
                                </div>
                              </div>
                              
                              {modality.descricao && (
                                <p className="text-sm text-muted-foreground">
                                  {modality.descricao}
                                </p>
                              )}
                              
                              <Button
                                size="sm"
                                disabled={readOnly || !canRegister || registerMutation.isPending}
                                onClick={() => registerMutation.mutate(modality.id)}
                                className={`w-full ${
                                  isRegistered 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : 'bg-olimpics-green-primary hover:bg-olimpics-green-secondary'
                                }`}
                              >
                                {registerMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processando...
                                  </>
                                ) : isRegistered ? (
                                  'Inscrito'
                                ) : (
                                  <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {readOnly ? 'Indisponível' : 'Inscrever-se'}
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
};
