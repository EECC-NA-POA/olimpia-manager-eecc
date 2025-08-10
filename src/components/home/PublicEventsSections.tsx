
import React from 'react';
import { Calendar, MapPin, ChevronRight, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePublicEvents } from '@/hooks/usePublicEvents';
import { buildEventUrl } from '@/utils/events';

function EventCard({ event }: { event: any }) {
  const location = [event.cidade, event.estado, event.pais].filter(Boolean).join(', ');
  const url = buildEventUrl(event);

  return (
    <Card className="relative bg-white/95 backdrop-blur-xl border-0 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all">
      <CardHeader className="relative bg-gradient-to-r from-olimpics-green-primary to-olimpics-green-secondary text-white">
        <div className="flex items-center justify-center mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-olimpics-orange-primary/30 rounded-2xl blur-xl" />
            <div className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-olimpics-orange-primary to-yellow-500 rounded-2xl shadow-2xl">
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        <CardTitle className="text-center text-2xl font-bold">{event.nome}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-olimpics-green-primary/5 to-transparent">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-olimpics-green-primary/20 to-olimpics-green-primary/10 rounded-xl">
              <Calendar className="h-5 w-5 text-olimpics-green-primary" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Período</p>
              <p className="text-gray-600 text-sm">
                {event.data_inicio_evento || event.data_inicio ? new Date(event.data_inicio_evento || event.data_inicio).toLocaleDateString() : '—'}
                {event.data_fim_evento || event.data_fim ? ` a ${new Date(event.data_fim_evento || event.data_fim).toLocaleDateString()}` : ''}
              </p>
            </div>
          </div>
          {location && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-olimpics-orange-primary/5 to-transparent">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-olimpics-orange-primary/20 to-olimpics-orange-primary/10 rounded-xl">
                <MapPin className="h-5 w-5 text-olimpics-orange-primary" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Local</p>
                <p className="text-gray-600 text-sm">{location}</p>
              </div>
            </div>
          )}
        </div>
        <div className="text-center">
          <a href={url} rel="noopener noreferrer">
            <Button className="bg-gradient-to-r from-olimpics-orange-primary to-yellow-500 hover:from-yellow-500 hover:to-olimpics-orange-primary text-white px-6">
              <span className="flex items-center gap-2">
                Mais informações <ChevronRight className="h-4 w-4" />
              </span>
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

export function PublicEventsSections() {
  const { data, isLoading } = usePublicEvents();

  return (
    <div className="relative py-20">
      <div className="container relative z-10 mx-auto px-4 space-y-12">
        {/* Abertos */}
        <div>
          <div className="text-center mb-10">
            <div className="relative inline-block mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl">
                <Calendar className="h-7 w-7 text-olimpics-orange-primary" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Eventos Públicos com Inscrições abertas</h2>
          </div>

          {isLoading ? (
            <div className="text-center text-white/80">Carregando eventos...</div>
          ) : data?.active && data.active.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {data.active.map(ev => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>
          ) : (
            <p className="text-center text-white/80">Nenhum evento público ativo no momento.</p>
          )}
        </div>

        {/* Encerrados */}
        <div>
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Eventos Públicos Encerrados</h2>
          </div>
          {isLoading ? (
            <div className="text-center text-white/80">Carregando eventos...</div>
          ) : data?.closed && data.closed.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {data.closed.map(ev => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>
          ) : (
            <p className="text-center text-white/80">Nenhum evento encerrado público para exibir.</p>
          )}
        </div>
      </div>
    </div>
  );
}
