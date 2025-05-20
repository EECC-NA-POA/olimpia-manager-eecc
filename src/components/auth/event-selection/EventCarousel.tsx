
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Event } from "@/lib/types/database";
import { EventCard } from "./EventCard";

interface EventWithStatus extends Event {
  isRegistered: boolean;
  roles?: Array<{ nome: string; codigo: string }>;
  isOpen?: boolean;
  isAdmin?: boolean;
}

interface EventCarouselProps {
  events: EventWithStatus[];
  selectedRole: 'ATL' | 'PGR';
  onRoleChange: (value: 'ATL' | 'PGR') => void;
  onEventAction: (eventId: string) => void;
  isUnderAge?: boolean;
}

export const EventCarousel = ({
  events,
  selectedRole,
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
  
  return (
    <div className="relative w-full">
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
                  isAdmin: event.isAdmin || false
                }}
                selectedRole={selectedRole}
                onRoleChange={onRoleChange}
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
