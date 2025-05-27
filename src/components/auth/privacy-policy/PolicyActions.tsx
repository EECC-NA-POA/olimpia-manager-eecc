
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log('PolicyActions - Starting logout process...');
      await signOut();
      console.log('PolicyActions - Logout successful, redirecting to home');
      toast.success('Logout realizado com sucesso!');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('PolicyActions - Error during logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <div className="flex justify-center">
      <Button 
        variant="outline" 
        className="w-full sm:w-auto flex items-center gap-2 border-gray-300 dark:border-gray-600"
        onClick={handleLogout}
        disabled={isLoading || isPending}
      >
        <LogOut className="w-4 h-4" />
        Sair
      </Button>
    </div>
  );
};
