
import { Event } from "@/types/athlete";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EventHeaderProps {
  eventData: Event;
}

export function EventHeader({ eventData }: EventHeaderProps) {
  const getEventHeaderColor = (status: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-success-background text-success-foreground hover:bg-success/10';
      case 'encerrado':
        return 'bg-destructive/10 text-destructive-foreground hover:bg-destructive/20';
      case 'suspenso':
        return 'bg-warning-background text-warning-foreground hover:bg-warning/10';
      default:
        return 'bg-neutral-background text-neutral-foreground hover:bg-neutral/10';
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-3 text-white p-4 rounded-lg shadow-md",
      getEventHeaderColor(eventData.status_evento)
    )}>
      <h1 className="text-2xl font-bold">
        {eventData.nome}
      </h1>
      <Badge className={`${getStatusColor(eventData.status_evento)} ml-2`}>
        {eventData.status_evento.charAt(0).toUpperCase() + eventData.status_evento.slice(1)}
      </Badge>
    </div>
  );
}
