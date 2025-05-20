
import { LogOut, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PolicyActionsProps {
  onAccept: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isPending: boolean;
  isAccepted: boolean;
  isDisabled: boolean;
}

export const PolicyActions = ({
  onAccept,
  onCancel,
  isLoading,
  isPending,
  isAccepted,
  isDisabled
}: PolicyActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button 
        variant="outline" 
        className="w-full sm:w-auto flex items-center gap-2 border-gray-300 dark:border-gray-600"
        onClick={onCancel}
      >
        <LogOut className="w-4 h-4" />
        Sair
      </Button>
      
      <Button
        className={`w-full sm:w-auto transition-all ${isAccepted ? 'bg-green-600 hover:bg-green-700' : 'bg-olimpics-green-primary hover:bg-olimpics-green-primary/90'}`}
        onClick={onAccept}
        disabled={isLoading || isPending || isAccepted || isDisabled}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Processando...
          </>
        ) : isAccepted ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Política de Privacidade Aceita
          </>
        ) : (
          <>
            <Check className="h-4 w-4 mr-2" />
            Concordo com a Política de Privacidade
          </>
        )}
      </Button>
    </div>
  );
};
