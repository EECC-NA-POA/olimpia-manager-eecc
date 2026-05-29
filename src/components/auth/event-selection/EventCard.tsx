
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, CalendarDays, CheckCircle2, Lock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Event } from "@/lib/types/database";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: Event & {
    isRegistered: boolean;
    hasBranchPermission?: boolean;
    roles?: Array<{ nome: string; codigo: string }>;
    availableRoles?: Array<{ nome: string; codigo: string }>;
    isOpen?: boolean;
    isAdmin?: boolean;
  };
  selectedRole: 'ATL' | 'PGR';
  onRoleChange: (value: 'ATL' | 'PGR') => void;
  onEventAction: () => void;
  isUnderAge?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  ativo:     { label: 'Ativo',     dot: 'bg-emerald-500 animate-pulse' },
  em_teste:  { label: 'Em teste',  dot: 'bg-blue-500' },
  encerrado: { label: 'Encerrado', dot: 'bg-gray-400' },
  suspenso:  { label: 'Suspenso',  dot: 'bg-amber-500' },
};

export const EventCard = ({
  event,
  selectedRole,
  onRoleChange,
  onEventAction,
  isUnderAge = false,
}: EventCardProps) => {
  const status = STATUS_CONFIG[event.status_evento] ?? STATUS_CONFIG.ativo;

  const isDisabled =
    !event.isRegistered &&
    !event.isAdmin &&
    (event.status_evento === 'encerrado' ||
      event.status_evento === 'suspenso' ||
      event.hasBranchPermission === false);

  const getButtonLabel = () => {
    if (event.isRegistered) return 'Acessar evento';
    if (event.hasBranchPermission === false) return 'Filial não autorizada';
    if (event.status_evento === 'encerrado') return 'Inscrições encerradas';
    if (event.status_evento === 'suspenso') return 'Evento suspenso';
    return 'Inscrever-se';
  };

  const showRoleSelector =
    !event.isRegistered &&
    !isDisabled &&
    (event.availableRoles?.some(r => r.codigo === 'ATL') ||
      (!isUnderAge && event.availableRoles?.some(r => r.codigo === 'PGR')));

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white overflow-hidden transition-all duration-200",
        event.isRegistered
          ? "border-emerald-300 shadow-md shadow-emerald-100/60"
          : "border-gray-200 hover:border-gray-300 hover:shadow-md",
        isDisabled && "opacity-70"
      )}
    >
      {/* Image */}
      <div className="relative h-36 sm:h-40 bg-gradient-to-br from-emerald-50 to-emerald-100 overflow-hidden">
        {event.foto_evento ? (
          <img
            src={event.foto_evento}
            alt={event.nome}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Trophy className="w-14 h-14 text-emerald-300" />
          </div>
        )}

        {/* Status pill */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm">
          <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", status.dot)} />
          <span className="text-[11px] font-semibold text-gray-700">{status.label}</span>
        </div>

        {/* Registered badge */}
        {event.isRegistered && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-600 rounded-full px-2.5 py-1 shadow-sm">
            <CheckCircle2 className="w-3 h-3 text-white flex-shrink-0" />
            <span className="text-[11px] font-semibold text-white">Inscrito</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-sm leading-snug text-gray-900 line-clamp-2">{event.nome}</h3>
          {event.descricao && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{event.descricao}</p>
          )}
        </div>

        {/* Dates */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            {format(new Date(event.data_inicio_inscricao), "dd MMM yyyy", { locale: ptBR })}
            {" – "}
            {format(new Date(event.data_fim_inscricao), "dd MMM yyyy", { locale: ptBR })}
          </span>
        </div>

        {/* User roles */}
        {event.isRegistered && event.roles && event.roles.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.roles.map((role, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 px-2 py-0"
              >
                {role.nome}
              </Badge>
            ))}
          </div>
        )}

        {/* Branch not authorized */}
        {event.hasBranchPermission === false && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 rounded-lg px-2.5 py-2">
            <Lock className="w-3.5 h-3.5 flex-shrink-0" />
            Sua filial não está autorizada neste evento
          </div>
        )}

        {/* Role selector */}
        {showRoleSelector && (
          <RadioGroup
            value={selectedRole}
            onValueChange={(v) => onRoleChange(v as 'ATL' | 'PGR')}
            className="flex gap-4"
          >
            {event.availableRoles?.some(r => r.codigo === 'ATL') && (
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="ATL" id={`atl-${event.id}`} />
                <Label htmlFor={`atl-${event.id}`} className="text-xs cursor-pointer">Atleta</Label>
              </div>
            )}
            {!isUnderAge && event.availableRoles?.some(r => r.codigo === 'PGR') && (
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="PGR" id={`pgr-${event.id}`} />
                <Label htmlFor={`pgr-${event.id}`} className="text-xs cursor-pointer">Público Geral</Label>
              </div>
            )}
          </RadioGroup>
        )}

        {/* Action button */}
        <Button
          size="sm"
          className={cn(
            "w-full text-xs h-9 font-semibold rounded-xl",
            event.isRegistered
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : isDisabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100"
              : "bg-olimpics-green-primary hover:bg-olimpics-green-primary/90 text-white"
          )}
          disabled={isDisabled}
          onClick={onEventAction}
        >
          {getButtonLabel()}
        </Button>
      </div>
    </div>
  );
};
