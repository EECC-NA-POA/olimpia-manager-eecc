
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function NoEventSelected() {
  const navigate = useNavigate();
  
  const handleEventSelection = () => {
    toast.info("Redirecionando para a seleção de eventos");
    navigate('/event-selection');
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-yellow-100 p-4 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Nenhum evento selecionado</h2>
        <p className="text-muted-foreground mb-4 max-w-lg">
          Para acessar esta página, selecione um evento na página de seleção de eventos.
        </p>
        <Button
          size="lg"
          onClick={handleEventSelection}
          className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary text-white"
        >
          Selecionar Evento
        </Button>
      </div>
    </div>
  );
}
