
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getAvailableEvents } from '@/lib/api';
import { Event } from '@/types/api';

interface EventSwitcherProps {
  userId: string;
  collapsed?: boolean; 
}

export function EventSwitcher({ userId, collapsed = false }: EventSwitcherProps) {
  const { currentEventId, setCurrentEventId } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Fetch available events
  const { data: availableEvents, isLoading } = useQuery({
    queryKey: ['available-events', userId],
    queryFn: () => getAvailableEvents(userId),
  });

  // Set selected event when events are loaded or currentEventId changes
  useEffect(() => {
    if (availableEvents && currentEventId) {
      const event = availableEvents.find(event => event.id === currentEventId);
      if (event) setSelectedEvent(event);
    }
  }, [availableEvents, currentEventId]);

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const eventId = e.target.value;
    setCurrentEventId(eventId);
    
    // Update selected event
    if (availableEvents) {
      const event = availableEvents.find(event => event.id === eventId);
      if (event) setSelectedEvent(event);
    }
  };

  if (isLoading) {
    return (
      <div className={`${collapsed ? 'w-8 h-8' : 'w-auto'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white"></div>
      </div>
    );
  }

  if (!availableEvents || availableEvents.length === 0) {
    return null;
  }

  return (
    <div className={`${collapsed ? 'hidden' : 'flex'} items-center min-w-[150px] text-sm`}>
      <select
        value={currentEventId || ''}
        onChange={handleEventChange}
        className="bg-olimpics-green-secondary/30 text-white rounded-md py-1 px-2 w-full border-none focus:ring-1 focus:ring-olimpics-green-secondary"
        style={{ maxWidth: collapsed ? '40px' : '200px' }}
      >
        {availableEvents.map(event => (
          <option key={event.id} value={event.id}>
            {event.nome}
          </option>
        ))}
      </select>
    </div>
  );
}
