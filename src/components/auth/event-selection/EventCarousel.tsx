
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Event } from "@/lib/types/database";
import { EventCard } from "./EventCard";

interface EventWithStatus extends Event {
  isRegistered: boolean;
  hasBranchPermission?: boolean;
  roles?: Array<{ nome: string; codigo: string }>;
  isOpen?: boolean;
  isAdmin?: boolean;
}

interface EventCarouselProps {
  events: EventWithStatus[];
  selectedRoleMap: Record<string, 'ATL' | 'PGR'>;
  onRoleChange: (eventId: string, value: 'ATL' | 'PGR') => void;
  onEventAction: (eventId: string) => void;
  isUnderAge?: boolean;
}

export const EventCarousel = ({
  events,
  selectedRoleMap,
  onRoleChange,
  onEventAction,
  isUnderAge = false,
}: EventCarouselProps) => {
  console.log('Rendering event carousel with events:', events);
  
  if (!events || events.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">Não há eventos disponíveis no momento.</p>
      </div>
    );
  }
  
  const hasUnregisteredEvents = events.some(e => !e.isRegistered);
  
  return (
    <div className="relative w-full space-y-4">
      {hasUnregisteredEvents && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-800">
            <strong>Atenção:</strong> Selecione <strong>"Atleta"</strong> se pretende participar de qualquer modalidade. Selecione <strong>"Público Geral"</strong> apenas se pretende ir para assistir.
          </AlertDescription>
        </Alert>
      )}
      <Carousel
        opts={{
          align: "start",
          loop: events.length > 3,
        }}
        className="w-full"
      >
        <CarouselContent>
          {events.map((event) => (
            <CarouselItem key={event.id} className="md:basis-1/3">
              <EventCard
                event={{
                  ...event,
                  roles: event.roles || [],
                  isOpen: event.isOpen !== false,
                  isAdmin: event.isAdmin || false,
                  hasBranchPermission: event.hasBranchPermission
                }}
                selectedRole={selectedRoleMap[event.id] ?? 'ATL'}
                onRoleChange={(value) => onRoleChange(event.id, value)}
                onEventAction={() => onEventAction(event.id)}
                isUnderAge={isUnderAge}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {events.length > 1 && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
      </Carousel>
    </div>
  );
};
