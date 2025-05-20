
import { LogOut } from "lucide-react";
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
        className="w-full sm:w-auto flex items-center gap-2"
        onClick={onCancel}
      >
        <LogOut className="w-4 h-4" />
        Sair
      </Button>
      
      <Button
        className="w-full sm:w-auto"
        onClick={onAccept}
        disabled={isLoading || isPending || isAccepted || isDisabled}
      >
        {isPending ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2" />
            Processando...
          </>
        ) : (
          "Concordo com a Política de Privacidade"
        )}
      </Button>
    </div>
  );
};
