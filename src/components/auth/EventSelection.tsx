
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Loader2, Trophy } from "lucide-react";
import { format } from "date-fns";
import { Event } from "@/lib/types/database";

interface EventSelectionProps {
  selectedEvents: string[];
  onEventSelect: (eventId: string) => void;
  mode: 'registration' | 'login';
}

export const EventSelection = ({ selectedEvents, onEventSelect, mode }: EventSelectionProps) => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['active-events'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .gte('data_fim_inscricao', today)
        .lte('data_inicio_inscricao', today)
        .order('data_inicio_inscricao', { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  if (!events?.length) {
    return (
      <div className="text-center p-8 text-gray-500">
        {mode === 'registration' 
          ? 'Não há eventos com inscrições abertas no momento.'
          : 'Você ainda não está inscrito em nenhum evento.'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {events.map((event) => (
        <Card 
          key={event.id}
          className={`
            relative overflow-hidden transition-all duration-200 hover:shadow-lg
            ${selectedEvents.includes(event.id) ? 'ring-2 ring-olimpics-green-primary' : ''}
          `}
        >
          <CardContent className="p-6">
            <div className="aspect-square rounded-lg mb-4 relative overflow-hidden bg-olimpics-green-primary/10">
              {event.foto_evento ? (
                <img
                  src={event.foto_evento}
                  alt={event.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Trophy className="w-16 h-16 text-olimpics-green-primary/50" />
                </div>
              )}
            </div>
            <h3 className="font-semibold text-lg mb-2">{event.nome}</h3>
            <p className="text-sm text-gray-500 mb-4">{event.descricao}</p>
            <div className="space-y-1 text-sm text-gray-500 mb-4">
              <p>Início: {format(new Date(event.data_inicio_inscricao), 'dd/MM/yyyy')}</p>
              <p>Término: {format(new Date(event.data_fim_inscricao), 'dd/MM/yyyy')}</p>
              <p className="text-xs uppercase font-medium mt-2">{event.tipo}</p>
            </div>
            <Button
              onClick={() => onEventSelect(event.id)}
              variant={selectedEvents.includes(event.id) ? "default" : "outline"}
              className="w-full"
            >
              {mode === 'registration' 
                ? selectedEvents.includes(event.id) ? 'Selecionado' : 'Selecionar'
                : 'Acessar'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
