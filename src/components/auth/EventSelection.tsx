
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Loader2, Trophy, LogOut } from "lucide-react";
import { format } from "date-fns";
import { Event } from "@/lib/types/database";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface EventSelectionProps {
  selectedEvents: string[];
  onEventSelect: (eventId: string) => void;
  mode: 'registration' | 'login';
}

export const EventSelection = ({ selectedEvents, onEventSelect, mode }: EventSelectionProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: events, isLoading } = useQuery({
    queryKey: ['active-events'],
    queryFn: async () => {
      // Get current date in Brazil timezone
      const brasiliaDate = new Date().toLocaleString("en-US", {
        timeZone: "America/Sao_Paulo"
      });
      const today = new Date(brasiliaDate).toISOString().split('T')[0];
      console.log('Fetching events for Brasília date:', today);
      
      // First, get the user's registered events
      const { data: registeredEvents, error: registrationError } = await supabase
        .from('inscricoes_eventos')
        .select('evento_id')
        .eq('usuario_id', user?.id);

      if (registrationError) {
        console.error('Error fetching registered events:', registrationError);
        throw registrationError;
      }

      const registeredEventIds = (registeredEvents || []).map(reg => reg.evento_id);
      console.log('User registered events:', registeredEventIds);

      // Then get all active events for the user's branch
      const { data, error } = await supabase
        .from('eventos')
        .select(`
          *,
          eventos_filiais!inner(filial_id)
        `)
        .gte('data_inicio_inscricao', today)
        .lte('data_fim_inscricao', today)
        .order('data_inicio_inscricao', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }
      
      // Add isRegistered flag to each event
      const eventsWithRegistrationStatus = data?.map(event => ({
        ...event,
        isRegistered: registeredEventIds.includes(event.id)
      }));
      
      console.log('Retrieved events with registration status:', eventsWithRegistrationStatus);
      return eventsWithRegistrationStatus;
    },
    enabled: !!user?.id,
  });

  const registerEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { data, error } = await supabase
        .from('inscricoes_eventos')
        .insert([
          {
            evento_id: eventId,
            usuario_id: user?.id,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error registering for event:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Inscrição realizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['active-events'] });
    },
    onError: (error) => {
      console.error('Registration error:', error);
      toast.error('Erro ao realizar inscrição. Tente novamente.');
    }
  });

  const handleEventRegistration = async (eventId: string) => {
    try {
      await registerEventMutation.mutateAsync(eventId);
      onEventSelect(eventId);
    } catch (error) {
      console.error('Error in handleEventRegistration:', error);
    }
  };

  const handleExit = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  if (!events?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="text-center text-gray-500">
          {mode === 'registration' 
            ? 'Não há eventos com inscrições abertas no momento.'
            : 'Você ainda não está inscrito em nenhum evento.'}
        </div>
        <Button
          onClick={handleExit}
          variant="outline"
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
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
            ${event.isRegistered ? 'ring-2 ring-olimpics-green-primary' : ''}
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
              onClick={() => event.isRegistered ? onEventSelect(event.id) : handleEventRegistration(event.id)}
              variant={event.isRegistered ? "default" : "outline"}
              className="w-full"
            >
              {event.isRegistered ? 'Acessar evento' : 'Quero me cadastrar'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
