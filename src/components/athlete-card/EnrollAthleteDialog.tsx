import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus } from "lucide-react";
import { useAvailableModalitiesForAthlete, AvailableModality } from '@/components/athlete-dashboard/hooks/useAvailableModalitiesForAthlete';
import { useEnrollAthleteInModality, EnrollmentType } from '@/hooks/useEnrollAthleteInModality';
import { cn } from '@/lib/utils';

interface EnrollAthleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  athleteId: string;
  athleteName: string;
  eventId: string;
  enrolledBy: string;
  enrollmentType: EnrollmentType;
}

export function EnrollAthleteDialog({
  open,
  onOpenChange,
  athleteId,
  athleteName,
  eventId,
  enrolledBy,
  enrollmentType
}: EnrollAthleteDialogProps) {
  const [selectedModality, setSelectedModality] = useState<number | null>(null);
  
  const { data: availableModalities, isLoading } = useAvailableModalitiesForAthlete(athleteId, eventId);
  const enrollMutation = useEnrollAthleteInModality();

  const handleEnroll = async () => {
    if (!selectedModality) return;

    await enrollMutation.mutateAsync({
      athleteId,
      modalityId: selectedModality,
      eventId,
      enrolledBy,
      enrollmentType
    });

    setSelectedModality(null);
    onOpenChange(false);
  };

  const groupedModalities = React.useMemo(() => {
    if (!availableModalities) return {};
    
    return availableModalities.reduce((acc, mod) => {
      const category = mod.categoria || 'Sem categoria';
      if (!acc[category]) acc[category] = [];
      acc[category].push(mod);
      return acc;
    }, {} as Record<string, AvailableModality[]>);
  }, [availableModalities]);

  const enrollmentTypeLabel = enrollmentType === 'organizador' ? 'Organizador' : 'Delegação';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Inscrever Atleta em Modalidade
          </DialogTitle>
          <DialogDescription>
            Inscrever <span className="font-semibold">{athleteName}</span> em uma modalidade como {enrollmentTypeLabel}.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !availableModalities || availableModalities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Não há modalidades disponíveis para inscrição.</p>
            <p className="text-sm mt-2">O atleta já pode estar inscrito em todas as modalidades do evento.</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {Object.entries(groupedModalities).map(([category, modalities]) => (
                <div key={category}>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">{category}</h4>
                  <div className="space-y-2">
                    {modalities.map((modality) => (
                      <div
                        key={modality.id}
                        onClick={() => setSelectedModality(modality.id)}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all",
                          selectedModality === modality.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{modality.nome}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {modality.tipo_modalidade}
                              </Badge>
                              {modality.limite_vagas && (
                                <span className="text-xs text-muted-foreground">
                                  {modality.vagas_ocupadas}/{modality.limite_vagas} vagas
                                </span>
                              )}
                            </div>
                          </div>
                          {selectedModality === modality.id && (
                            <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleEnroll}
            disabled={!selectedModality || enrollMutation.isPending}
          >
            {enrollMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inscrevendo...
              </>
            ) : (
              'Confirmar Inscrição'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
