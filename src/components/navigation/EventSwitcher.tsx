
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getAvailableEvents } from '@/lib/api';
import { Event } from '@/types/api';
import { ChevronDown } from 'lucide-react';
import { MobileEventSwitcher } from './MobileEventSwitcher';

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

  // Use mobile switcher on small screens
  return (
    <>
      {/* Mobile Event Switcher - shown on screens smaller than md */}
      <div className="block md:hidden">
        <MobileEventSwitcher userId={userId} />
      </div>
      
      {/* Desktop and Mobile unified: always use dialog-based switcher for better UX and contrast */}
      <div className={`${collapsed ? 'hidden' : ''} items-center min-w-[180px] text-sm relative`}>
        <MobileEventSwitcher userId={userId} />
      </div>
    </>
  );
}
