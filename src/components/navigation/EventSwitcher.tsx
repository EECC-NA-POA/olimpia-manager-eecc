import { ArrowLeftRight } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

interface EventSwitcherProps {
  userId: string;
  collapsed?: boolean;
}

export function EventSwitcher({ userId, collapsed = false }: EventSwitcherProps) {
  const navigate = useNavigate();
  
  const { data: userEvents } = useQuery({
    queryKey: ['user-events', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('inscricoes_eventos')
        .select(`
          evento_id,
          eventos (
            id,
            nome,
            status_evento
          )
        `)
        .eq('usuario_id', userId);

      if (error) {
        console.error('Error fetching user events:', error);
        throw error;
      }

      return data.map(item => item.eventos);
    },
    enabled: !!userId
  });

  const handleEventSwitch = (eventId: string) => {
    console.log('Setting current event ID:', eventId);
    localStorage.setItem('currentEventId', eventId);
    
    // Force context update by reloading the page
    toast.success('Evento selecionado com sucesso!');
    navigate(0); // This is equivalent to window.location.reload()
  };

  if (!userEvents || userEvents.length <= 1) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="w-full rounded-lg p-4 flex items-center gap-3 
            text-white hover:bg-olimpics-green-secondary/20 
            transition-all duration-200 text-lg font-medium"
          title={collapsed ? "Trocar Evento" : undefined}
          style={{ zIndex: 51 }} /* Inline style to ensure proper stacking */
        >
          <ArrowLeftRight className="h-7 w-7 flex-shrink-0" />
          <span className={collapsed ? 'hidden' : 'block'}>Trocar Evento</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 z-[100]">
        {userEvents.map((event: any) => (
          <DropdownMenuItem
            key={event.id}
            onClick={() => handleEventSwitch(event.id)}
            className="cursor-pointer"
          >
            {event.nome}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
