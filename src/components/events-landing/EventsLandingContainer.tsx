
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { EventsHeader } from './EventsHeader';
import { EventsFilters } from './EventsFilters';
import { EventsGrid } from './EventsGrid';
import { SystemFeaturesSection } from './SystemFeaturesSection';
import { LoadingImage } from '@/components/ui/loading-image';
import { Event } from '@/lib/types/database';
import { Calendar } from 'lucide-react';

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
    return (
      <div className="min-h-screen">
        <EventsHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <LoadingImage text="Carregando sistema..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-olimpics-green-primary">
        <EventsHeader />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Calendar className="h-16 w-16 text-white/80 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-4">
                Eventos em Preparação
              </h3>
              <p className="text-white/90 mb-6 leading-relaxed">
                No momento não há eventos públicos disponíveis para visualização. 
                Novos eventos serão publicados em breve.
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

      {/* Philosopher Quotes Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Sabedoria dos Filósofos
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Reflexões sobre excelência, disciplina e virtude
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 max-w-6xl mx-auto shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-olimpics-green-primary/5 p-6 rounded-lg border-l-4 border-olimpics-green-primary">
                <h4 className="font-bold text-olimpics-green-primary mb-3">Platão (428–348 a.C.)</h4>
                <p className="text-gray-700 italic text-sm leading-relaxed mb-2">
                  "O homem pode aprender virtudes e disciplina tanto na música quanto na ginástica, pois ambas moldam a alma e o corpo."
                </p>
                <p className="text-xs text-gray-600">— Platão, A República (Livro III)</p>
              </div>

              <div className="bg-olimpics-orange-primary/5 p-6 rounded-lg border-l-4 border-olimpics-orange-primary">
                <h4 className="font-bold text-olimpics-orange-primary mb-3">Aristóteles (384–322 a.C.)</h4>
                <p className="text-gray-700 italic text-sm leading-relaxed mb-2">
                  "Somos o que repetidamente fazemos. A excelência, portanto, não é um feito, mas um hábito."
                </p>
                <p className="text-xs text-gray-600">— Aristóteles, Ética a Nicômaco</p>
              </div>

              <div className="bg-olimpics-green-primary/5 p-6 rounded-lg border-l-4 border-olimpics-green-primary">
                <h4 className="font-bold text-olimpics-green-primary mb-3">Epicteto (50–135 d.C.)</h4>
                <p className="text-gray-700 italic text-sm leading-relaxed mb-2">
                  "Se você quer vencer nos Jogos Olímpicos, deve se preparar, exercitar-se, comer moderadamente, suportar a fadiga e obedecer ao treinador."
                </p>
                <p className="text-xs text-gray-600">— Enchirídion" (ou "Manual")</p>
              </div>

              <div className="bg-olimpics-orange-primary/5 p-6 rounded-lg border-l-4 border-olimpics-orange-primary">
                <h4 className="font-bold text-olimpics-orange-primary mb-3">Sêneca (4 a.C.–65 d.C.)</h4>
                <p className="text-gray-700 italic text-sm leading-relaxed mb-2">
                  "A vida é como um gladiador nos jogos: não se trata apenas de sobreviver, mas de lutar bem."
                </p>
                <p className="text-xs text-gray-600">— Sêneca, Cartas a Lucílio</p>
              </div>

              <div className="bg-olimpics-green-primary/5 p-6 rounded-lg border-l-4 border-olimpics-green-primary">
                <h4 className="font-bold text-olimpics-green-primary mb-3">Diógenes de Sinope (412–323 a.C.)</h4>
                <p className="text-gray-700 italic text-sm leading-relaxed mb-2">
                  "Os vencedores dos Jogos Olímpicos recebem apenas uma coroa de louros; mas os que vivem com virtude recebem a verdadeira glória."
                </p>
                <p className="text-xs text-gray-600">— Diógenes, citado por Diógenes Laércio</p>
              </div>

              <div className="bg-olimpics-orange-primary/5 p-6 rounded-lg border-l-4 border-olimpics-orange-primary">
                <h4 className="font-bold text-olimpics-orange-primary mb-3">Cícero (106–43 a.C.)</h4>
                <p className="text-gray-700 italic text-sm leading-relaxed mb-2">
                  "O esforço e a perseverança sempre superam o talento que não se disciplina."
                </p>
                <p className="text-xs text-gray-600">— Cícero, De Officiis</p>
              </div>

              <div className="bg-olimpics-green-primary/5 p-6 rounded-lg border-l-4 border-olimpics-green-primary lg:col-start-2">
                <h4 className="font-bold text-olimpics-green-primary mb-3">Píndaro (518–438 a.C.)</h4>
                <p className="text-gray-700 italic text-sm leading-relaxed mb-2">
                  "Ó minha alma, não aspire à vida imortal, mas esgote o campo do possível."
                </p>
                <p className="text-xs text-gray-600">(Não filósofo, mas poeta dos Jogos Olímpicos)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
