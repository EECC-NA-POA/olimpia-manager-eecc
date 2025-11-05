
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Event } from "@/lib/types/database";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: Event & {
    isRegistered: boolean;
    hasBranchPermission?: boolean;
    roles?: Array<{ nome: string; codigo: string }>;
    isOpen?: boolean;
    isAdmin?: boolean;
  };
  selectedRole: 'ATL' | 'PGR';
  onRoleChange: (value: 'ATL' | 'PGR') => void;
  onEventAction: () => void;
  isUnderAge?: boolean;
}

export const EventCard = ({ 
  event, 
  selectedRole, 
  onRoleChange, 
  onEventAction,
  isUnderAge = false
}: EventCardProps) => {
  const isDisabled = ((event.status_evento === 'encerrado' || event.status_evento === 'suspenso') 
    && !event.isRegistered 
    && !event.isAdmin) || (event.hasBranchPermission === false);

  const getStatusStripeColor = (status: string) => {
    switch (status) {
      case 'encerrado':
        return 'bg-red-600';
      case 'suspenso':
        return 'bg-yellow-500';
      case 'em_teste':
        return 'bg-blue-500';
      default:
        return 'bg-olimpics-green-primary';
    }
  };

  const getButtonLabel = () => {
    if (event.isRegistered) return 'Acessar evento';
    if (event.hasBranchPermission === false) return 'Filial não autorizada';
    if (isDisabled) return event.status_evento === 'encerrado' ? 'Inscrições encerradas' : 'Evento suspenso';
    return 'Quero me cadastrar';
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-200 hover:shadow-lg mx-1 sm:mx-2 max-w-sm",
        event.isRegistered && "ring-2 ring-olimpics-green-primary"
      )}
    >
      <div
        className={cn(
          "absolute -right-8 sm:-right-12 top-6 sm:top-8 w-32 sm:w-48 -rotate-45 transform text-center",
          getStatusStripeColor(event.status_evento),
          "text-white font-medium py-1 shadow-md text-xs sm:text-sm"
        )}
        style={{
          zIndex: 10,
        }}
      >
        {event.status_evento.charAt(0).toUpperCase() + event.status_evento.slice(1)}
      </div>

      <CardContent className="p-4 sm:p-6">
        {(event.status_evento === 'encerrado' || event.status_evento === 'suspenso') && !event.isRegistered && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs sm:text-sm">
              {event.status_evento === 'encerrado' 
                ? 'Este evento está encerrado para novas inscrições.' 
                : 'Este evento está temporariamente suspenso.'}
            </AlertDescription>
          </Alert>
        )}
        
        {event.hasBranchPermission === false && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs sm:text-sm">
              Sua filial não está autorizada a participar deste evento.
            </AlertDescription>
          </Alert>
        )}

        <div className="aspect-square rounded-lg mb-3 sm:mb-4 relative overflow-hidden bg-olimpics-green-primary/10">
          {event.foto_evento ? (
            <img
              src={event.foto_evento}
              alt={event.nome}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = 'w-full h-full flex items-center justify-center';
                  fallback.innerHTML = '<svg class="w-12 h-12 sm:w-16 sm:h-16 text-olimpics-green-primary/50" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5Z"/><path d="M12 12.5V17"/><path d="M17 14.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/><path d="M18 9h-.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5Z"/><path d="m21 3-7 7"/><path d="M12 12.5V8.5a2.5 2.5 0 1 0-5 0V17a2.5 2.5 0 1 0 5 0Z"/></svg>';
                  parent.appendChild(fallback);
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-olimpics-green-primary/50" />
            </div>
          )}
        </div>
        <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-2">{event.nome}</h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 line-clamp-3">{event.descricao}</p>
        <div className="space-y-1 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
          <p>Início: {format(new Date(event.data_inicio_inscricao), 'dd/MM/yyyy')}</p>
          <p>Término: {format(new Date(event.data_fim_inscricao), 'dd/MM/yyyy')}</p>
          <p className="text-xs uppercase font-medium mt-2">{event.tipo}</p>
          {event.isRegistered && (
            <p className="text-xs font-medium text-green-600 mt-1">
              Você já está inscrito neste evento
            </p>
          )}
        </div>
        {!event.isRegistered && !isDisabled && (
          <div className="mb-3 sm:mb-4">
            <RadioGroup
              name={`role-${event.id}`}
              value={selectedRole}
              onValueChange={(value) => onRoleChange(value as 'ATL' | 'PGR')}
              className="space-y-2"
            >
              {/* Show Atleta option if available */}
              {(!event.roles || event.roles.length === 0 || event.roles.some(r => r.codigo === 'ATL' || r.nome === 'Atleta')) && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ATL" id={`atleta-${event.id}`} />
                  <Label htmlFor={`atleta-${event.id}`} className="text-sm">Atleta</Label>
                </div>
              )}
              {/* Show Público Geral option only if user is not underage AND profile exists for this event */}
              {!isUnderAge && (!event.roles || event.roles.length === 0 || event.roles.some(r => r.codigo === 'PGR' || r.nome === 'Público Geral')) && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PGR" id={`publico-${event.id}`} />
                  <Label htmlFor={`publico-${event.id}`} className="text-sm">Público Geral</Label>
                </div>
              )}
            </RadioGroup>
          </div>
        )}
        <Button
          onClick={onEventAction}
          variant={event.isRegistered ? "default" : "outline"}
          className="w-full text-xs sm:text-sm py-2"
          disabled={isDisabled}
          size="sm"
        >
          {getButtonLabel()}
        </Button>
      </CardContent>
    </Card>
  );
};
