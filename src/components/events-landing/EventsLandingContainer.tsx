
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { EventsHeader } from './EventsHeader';
import { SystemFeaturesSection } from './SystemFeaturesSection';
import { EventsSection } from './EventsSection';
import { PhilosopherQuotesSection } from './PhilosopherQuotesSection';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { Event } from '@/lib/types/database';

type FilterStatus = 'all' | 'open' | 'closed' | 'upcoming';
type SortBy = 'date' | 'name';

export function EventsLandingContainer() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['public-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('visibilidade_publica', true)
        .order('data_inicio_inscricao', { ascending: false });

      if (error) throw error;
      return data as Event[];
    },
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  // Always show the page structure, even if no public events are available
  const publicEvents = events || [];

  return (
    <div className="min-h-screen bg-olimpics-green-primary">
      <EventsHeader />
      
      {/* System Features Section */}
      <div className="bg-gradient-to-b from-white to-olimpics-background py-16">
        <div className="container mx-auto px-4">
          <SystemFeaturesSection />
        </div>
      </div>
      
      {/* Events Section */}
      <EventsSection 
        events={publicEvents}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Philosopher Quotes Section - Always render this section */}
      <PhilosopherQuotesSection />
    </div>
  );
}
