
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
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'encerrado':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'suspenso':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
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
