
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { EventsHeader } from './EventsHeader';
import { EventsFilters } from './EventsFilters';
import { EventsGrid } from './EventsGrid';
import { SystemFeaturesSection } from './SystemFeaturesSection';
import { LoadingImage } from '@/components/ui/loading-image';
import { Event } from '@/lib/types/database';
import { Calendar } from 'lucide-react';

type FilterStatus = 'all' | 'open' | 'closed' | 'upcoming';
type SortBy = 'date' | 'name';

// Create a public-only Supabase client for anonymous access
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sb.nova-acropole.org.br/';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiLm5vdmEtYWNyb3BvbGUub3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTc0NzY4MDAsImV4cCI6MjAxMzA1MjgwMH0.xyz123';

const publicSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

export function EventsLandingContainer() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['public-events-view'],
    queryFn: async () => {
      console.log('Fetching public events from view with anonymous client...');
      
      const { data, error } = await publicSupabase
        .from('vw_eventos_publicos_abertos')
        .select('*')
        .order('data_inicio_inscricao', { ascending: false });

      if (error) {
        console.error('Error fetching public events:', error);
        throw error;
      }

      console.log('Public events fetched:', data?.length || 0);
      return data as Event[];
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <EventsHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <LoadingImage text="Carregando eventos..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading public events:', error);
    return (
      <div className="min-h-screen bg-olimpics-green-primary">
        <EventsHeader />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Calendar className="h-16 w-16 text-white/80 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-4">
                Erro ao Carregar Eventos
              </h3>
              <p className="text-white/90 mb-6 leading-relaxed">
                Não foi possível carregar os eventos públicos. Tente novamente mais tarde.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Always show the page structure, even if no public events are available
  const publicEvents = events || [];

  const filteredEvents = publicEvents.filter(event => {
    if (filterStatus === 'all') return true;
    
    const now = new Date();
    const startDate = new Date(event.data_inicio_inscricao);
    const endDate = new Date(event.data_fim_inscricao);
    
    switch (filterStatus) {
      case 'open':
        return now >= startDate && now <= endDate && event.status_evento === 'ativo';
      case 'closed':
        return now > endDate || event.status_evento === 'encerrado';
      case 'upcoming':
        return now < startDate;
      default:
        return true;
    }
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'name') {
      return a.nome.localeCompare(b.nome);
    }
    return new Date(b.data_inicio_inscricao).getTime() - new Date(a.data_inicio_inscricao).getTime();
  });

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
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Eventos Disponíveis
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Descubra e participe dos eventos esportivos organizados pela EECC
            </p>
          </div>
          
          {publicEvents.length > 0 && (
            <EventsFilters
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          )}
          <EventsGrid events={sortedEvents} />
        </div>
      </div>
    </div>
  );
}
