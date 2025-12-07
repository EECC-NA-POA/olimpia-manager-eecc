import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Users, User, Plus, ListChecks } from "lucide-react";

interface Modality {
  id: string;
  nome: string;
  tipo: string;
  categoria: string;
  descricao?: string;
  grupo?: string;
}

interface AvailableModalitiesForAthleteProps {
  modalities: Modality[];
  registeredModalityIds: string[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRegister: (modalityId: string) => void;
  isRegistering: boolean;
  isReadOnly?: boolean;
}

const getCategoryLabel = (categoria: string): string => {
  switch (categoria?.toLowerCase()) {
    case 'masculino':
      return 'Masculino';
    case 'feminino':
      return 'Feminino';
    case 'mista':
    case 'misto':
      return 'Mista';
    default:
      return categoria || '';
  }
};

const getTypeIcon = (tipo: string) => {
  return tipo?.toLowerCase() === 'equipe' ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />;
};

export function AvailableModalitiesForAthlete({
  modalities,
  registeredModalityIds,
  isOpen,
  onOpenChange,
  onRegister,
  isRegistering,
  isReadOnly = false
}: AvailableModalitiesForAthleteProps) {
  // Filter out modalities the athlete is already registered for
  const availableModalities = modalities.filter(
    (mod) => !registeredModalityIds.includes(mod.id)
  );

  if (availableModalities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Modalidades Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            {modalities.length === 0
              ? "Nenhuma modalidade disponível para este evento."
              : "Você já está inscrito em todas as modalidades disponíveis!"}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group modalities by grupo
  const groupedModalities = availableModalities.reduce((acc, modality) => {
    const group = modality.grupo || 'Outras';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(modality);
    return acc;
  }, {} as Record<string, Modality[]>);

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                Modalidades Disponíveis
                <Badge variant="outline" className="ml-2">
                  {availableModalities.length}
                </Badge>
              </CardTitle>
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {Object.entries(groupedModalities).map(([group, items]) => (
              <div key={group} className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  {group}
                </h4>
                <div className="grid gap-3">
                  {items.map((modality) => (
                    <div
                      key={modality.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-muted">
                          {getTypeIcon(modality.tipo)}
                        </div>
                        <div>
                          <p className="font-medium">{modality.nome}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{modality.tipo === 'equipe' ? 'Equipe' : 'Individual'}</span>
                            {modality.categoria && (
                              <>
                                <span>•</span>
                                <span>{getCategoryLabel(modality.categoria)}</span>
                              </>
                            )}
                          </div>
                          {modality.descricao && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {modality.descricao}
                            </p>
                          )}
                        </div>
                      </div>
                      {!isReadOnly && (
                        <Button
                          size="sm"
                          onClick={() => onRegister(modality.id)}
                          disabled={isRegistering}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Inscrever-se
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
