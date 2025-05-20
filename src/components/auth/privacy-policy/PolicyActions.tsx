
import { LogOut, Loader2 } from "lucide-react";
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
  onCancel,
  isLoading,
  isPending
}: PolicyActionsProps) => {
  return (
    <div className="flex justify-center">
      <Button 
        variant="outline" 
        className="w-full sm:w-auto flex items-center gap-2 border-gray-300 dark:border-gray-600"
        onClick={onCancel}
        disabled={isLoading || isPending}
      >
        <LogOut className="w-4 h-4" />
        Voltar
      </Button>
    </div>
  );
};
